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
