const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');

class RakutenRMSScraper {
  constructor(credentials) {
    this.credentials = credentials;
    this.browser = null;
    this.page = null;
    this.storage = process.env.GOOGLE_APPLICATION_CREDENTIALS ? new Storage() : null;
    this.firestore = process.env.GOOGLE_APPLICATION_CREDENTIALS ? new Firestore() : null;
    this.bucketName = process.env.GCS_BUCKET_NAME || 'rakuten-rms-data';
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(60000);
  }

  async updateStatus(status, message, progress = null) {
    console.log(`[${status}] ${message}`);
    if (this.onStatusUpdate) {
      this.onStatusUpdate({ status, message, progress });
    }
  }

  async login() {
    try {
      await this.updateStatus('logging_in', 'R-Loginページにアクセス中...');
      await this.page.goto('https://glogin.rms.rakuten.co.jp/');
      
      await this.updateStatus('logging_in', 'R-Login ID/パスワードを入力中...');
      await this.page.fill('input[name="login_id"]', this.credentials.rLoginId);
      await this.page.fill('input[name="passwd"]', this.credentials.rLoginPassword);
      await this.page.click('input[type="submit"][value="次へ"]');
      
      await this.page.waitForLoadState('networkidle');
      
      if (await this.page.locator('input[name="user_id"]').isVisible()) {
        await this.updateStatus('logging_in', 'ユーザーID/パスワードを入力中...');
        await this.page.fill('input[name="user_id"]', this.credentials.userId);
        await this.page.fill('input[name="user_passwd"]', this.credentials.userPassword);
        await this.page.click('input[type="submit"][value="ログイン"]');
      }
      
      await this.page.waitForLoadState('networkidle');
      
      const has2FA = await this.page.locator('text=/認証コード|二段階認証/').isVisible();
      if (has2FA) {
        await this.updateStatus('waiting_2fa', '2段階認証コードの入力を待っています...');
        
        if (this.credentials.twoFactorCode) {
          await this.page.fill('input[type="text"][maxlength="6"]', this.credentials.twoFactorCode);
          await this.page.click('input[type="submit"]');
        } else {
          throw new Error('2段階認証コードが必要です');
        }
      }
      
      await this.page.waitForSelector('text=/RMS|管理画面/', { timeout: 30000 });
      await this.updateStatus('logging_in', 'ログイン成功');
      
    } catch (error) {
      await this.updateStatus('error', `ログインエラー: ${error.message}`);
      throw error;
    }
  }

  async navigateToDataAnalysis() {
    try {
      await this.updateStatus('fetching_data', 'データ分析ページに移動中...');
      
      await this.page.click('a:has-text("データ分析")');
      await this.page.waitForLoadState('networkidle');
      
      await this.page.click('text="アクセス・流入分析"');
      await this.page.waitForLoadState('networkidle');
      
      await this.page.click('text="商品ページ"');
      await this.page.waitForLoadState('networkidle');
      
    } catch (error) {
      await this.updateStatus('error', `ナビゲーションエラー: ${error.message}`);
      throw error;
    }
  }

  async setDateRange() {
    try {
      await this.updateStatus('fetching_data', '期間を設定中...', 50);
      
      const startDateInput = await this.page.locator('input[name="date_from"]');
      const endDateInput = await this.page.locator('input[name="date_to"]');
      
      await startDateInput.fill(this.credentials.startDate.replace(/-/g, ''));
      await endDateInput.fill(this.credentials.endDate.replace(/-/g, ''));
      
      await this.page.click('input[type="submit"][value="表示"]');
      await this.page.waitForLoadState('networkidle');
      
    } catch (error) {
      await this.updateStatus('error', `日付設定エラー: ${error.message}`);
      throw error;
    }
  }

  async downloadCSV() {
    try {
      await this.updateStatus('fetching_data', 'CSVをダウンロード中...', 75);
      
      const downloadPromise = this.page.waitForEvent('download');
      await this.page.click('a:has-text("商品単位")[href*="csv"]');
      const download = await downloadPromise;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `rakuten_sales_${this.credentials.userId}_${timestamp}.csv`;
      const localPath = path.join('/tmp', fileName);
      
      await download.saveAs(localPath);
      
      await this.updateStatus('fetching_data', 'CSVをクラウドストレージに保存中...', 90);
      
      if (this.storage) {
        const bucket = this.storage.bucket(this.bucketName);
        await bucket.upload(localPath, {
          destination: `rakuten/${fileName}`,
          metadata: {
            contentType: 'text/csv',
            metadata: {
              userId: this.credentials.userId,
              startDate: this.credentials.startDate,
              endDate: this.credentials.endDate,
              downloadedAt: new Date().toISOString()
            }
          }
        });
        
        if (this.firestore) {
          await this.firestore.collection('downloads').add({
            platform: 'rakuten',
            userId: this.credentials.userId,
            fileName: fileName,
            gcsPath: `rakuten/${fileName}`,
            startDate: this.credentials.startDate,
            endDate: this.credentials.endDate,
            downloadedAt: new Date(),
            status: 'completed'
          });
        }
      }
      
      const csvContent = await fs.readFile(localPath, 'utf-8');
      await fs.unlink(localPath);
      
      await this.updateStatus('completed', 'データ取得完了', 100);
      return { fileName, csvContent };
      
    } catch (error) {
      await this.updateStatus('error', `CSVダウンロードエラー: ${error.message}`);
      throw error;
    }
  }

  async scrape() {
    try {
      await this.init();
      await this.login();
      await this.navigateToDataAnalysis();
      await this.setDateRange();
      const result = await this.downloadCSV();
      return result;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  setStatusCallback(callback) {
    this.onStatusUpdate = callback;
  }
}

if (require.main === module) {
  const credentials = {
    rLoginId: process.env.R_LOGIN_ID || process.argv[2],
    rLoginPassword: process.env.R_LOGIN_PASSWORD || process.argv[3],
    userId: process.env.USER_ID || process.argv[4],
    userPassword: process.env.USER_PASSWORD || process.argv[5],
    twoFactorCode: process.env.TWO_FACTOR_CODE || process.argv[6],
    startDate: process.env.START_DATE || process.argv[7],
    endDate: process.env.END_DATE || process.argv[8]
  };

  const scraper = new RakutenRMSScraper(credentials);
  scraper.scrape()
    .then(result => {
      console.log('Success:', result.fileName);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = RakutenRMSScraper;