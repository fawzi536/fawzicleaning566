# إعداد Google Apps Script للمزامنة التلقائية
## تعليمات مفصلة خطوة بخطوة

### الخطوة 1: فتح Google Apps Script
1. افتح جدول Google Sheets الخاص بك (ID: 14kbGPoC4ld3tkDAuVWGO36FjNtRvY0xKBXc_y0vUkZI)
2. من القائمة العلوية، اختر: **الإضافات** (Extensions) → **Apps Script**

### الخطوة 2: نسخ الكود التالي
احذف أي كود موجود في المحرر، وانسخ الكود التالي بالكامل:

```javascript
// معرف جدول Google Sheets
const SPREADSHEET_ID = '14kbGPoC4ld3tkDAuVWGO36FjNtRvY0xKBXc_y0vUkZI';

// دالة لاستقبال البيانات من الموقع
function doPost(e) {
  try {
    // قراءة البيانات المرسلة
    const data = JSON.parse(e.postData.contents);
    const action = data.action; // 'create' or 'update'
    const order = data.order;
    
    // فتح الجدول
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    if (action === 'create') {
      // إضافة طلب جديد
      appendOrder(sheet, order);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'تم إضافة الطلب بنجاح'
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'update') {
      // تحديث طلب موجود
      updateOrder(sheet, order);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'تم تحديث الطلب بنجاح'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'خطأ: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة لإضافة طلب جديد
function appendOrder(sheet, order) {
  const row = [
    order.orderNumber || '',
    order.orderDate || '',
    order.customerNumber || '',
    order.customerName || '',
    order.area || '',
    order.street || '',
    order.houseNumber || '',
    order.floor || '',
    order.housingType || '',
    order.locationNotes || '',
    order.serviceType || '',
    order.visitDate || '',
    order.visitTime || '',
    order.cleaningDate || '',
    order.cleaningTime || '',
    order.paymentMethod || '',
    order.totalAmount || '',
    order.paymentStatus || '',
    order.bookingStatus || '',
    order.departureTime || '',
    order.customerNotes || '',
    order.teamNotes || '',
    order.customerRating || 0,
    order.ratingNotes || '',
    order.cancellationReason || ''
  ];
  
  sheet.appendRow(row);
}

// دالة لتحديث طلب موجود
function updateOrder(sheet, order) {
  const orderNumber = order.orderNumber;
  const data = sheet.getDataRange().getValues();
  
  // البحث عن رقم الطلب
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == orderNumber) {
      const row = i + 1; // الصفوف تبدأ من 1
      
      // تحديث البيانات
      sheet.getRange(row, 1, 1, 25).setValues([[
        order.orderNumber || '',
        order.orderDate || '',
        order.customerNumber || '',
        order.customerName || '',
        order.area || '',
        order.street || '',
        order.houseNumber || '',
        order.floor || '',
        order.housingType || '',
        order.locationNotes || '',
        order.serviceType || '',
        order.visitDate || '',
        order.visitTime || '',
        order.cleaningDate || '',
        order.cleaningTime || '',
        order.paymentMethod || '',
        order.totalAmount || '',
        order.paymentStatus || '',
        order.bookingStatus || '',
        order.departureTime || '',
        order.customerNotes || '',
        order.teamNotes || '',
        order.customerRating || 0,
        order.ratingNotes || '',
        order.cancellationReason || ''
      ]]);
      
      return;
    }
  }
  
  // إذا لم يتم العثور على الطلب، أضفه كطلب جديد
  appendOrder(sheet, order);
}

// دالة اختبار (يمكن حذفها بعد التأكد من عمل النظام)
function testDoPost() {
  const testData = {
    action: 'create',
    order: {
      orderNumber: 999,
      orderDate: '01-01-2025',
      customerNumber: '12345678',
      customerName: 'اختبار',
      area: 'منطقة اختبار',
      bookingStatus: 'معاينة'
    }
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}
```

### الخطوة 3: نشر السكريبت كـ Web App
1. اضغط على زر **نشر** (Deploy) في الأعلى
2. اختر **نشر جديد** (New deployment)
3. في "نوع" (Type)، اختر **تطبيق ويب** (Web app)
4. في الإعدادات:
   - **وصف**: "مزامنة تلقائية للطلبات"
   - **تنفيذ كـ**: اختر **أنا** (Me)
   - **من يملك صلاحية الوصول**: اختر **أي شخص** (Anyone)
5. اضغط **نشر** (Deploy)
6. قد يطلب منك منح الأذونات - اضغط **مراجعة الأذونات** (Review Permissions)
7. اختر حسابك في Google
8. اضغط **متقدم** (Advanced) ثم **الانتقال إلى [اسم المشروع]** (Go to [project name])
9. اضغط **السماح** (Allow)

### الخطوة 4: نسخ رابط Web App
1. بعد النشر، ستظهر نافذة بها **رابط Web App URL**
2. انسخ هذا الرابط بالكامل - سيبدو شبيهاً بـ:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
3. احفظ هذا الرابط - ستحتاجه في الخطوة التالية

### الخطوة 5: إضافة الرابط في موقعك
1. افتح ملف `index.html` في الموقع
2. ابحث عن السطر الذي يحتوي على:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = '';
   ```
3. ضع الرابط الذي نسخته بين العلامتين:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```

### الخطوة 6: اختبار النظام
1. احفظ التغييرات في الموقع
2. سجل طلب جديد
3. يجب أن يظهر إشعار "تم إرسال البيانات إلى Google Sheets تلقائياً"
4. تحقق من جدول Google Sheets - يجب أن تجد الطلب مضافاً تلقائياً

### ملاحظات مهمة:
- ✅ لن تحتاج بعد الآن للنسخ واللصق اليدوي
- ✅ البيانات تُرسل تلقائياً عند إضافة أو تعديل أي طلب
- ✅ يمكنك متابعة قراءة البيانات من Google Sheets كما هو حالياً
- ⚠️ تأكد من عدم مشاركة رابط Web App مع أشخاص غير موثوقين
- ⚠️ إذا حدث خطأ، تحقق من الرابط وأذونات الجدول

### في حالة المشاكل:
1. تأكد من أن رابط Web App صحيح ويحتوي على `/exec` في النهاية
2. تأكد من أن Apps Script له صلاحية الوصول للجدول
3. افتح Console في المتصفح (F12) وتحقق من أي رسائل خطأ
4. تحقق من أن الجدول له نفس الأعمدة بنفس الترتيب (25 عمود)

---

## للمطورين: هيكل البيانات المرسلة

### عند إنشاء طلب جديد:
```json
{
  "action": "create",
  "order": {
    "orderNumber": 1,
    "orderDate": "01-01-2025",
    "customerNumber": "12345678",
    ...
  }
}
```

### عند تحديث طلب:
```json
{
  "action": "update",
  "order": {
    "orderNumber": 1,
    "bookingStatus": "مكتمل",
    ...
  }
}
```
