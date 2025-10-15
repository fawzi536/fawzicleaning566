# مزامنة Sheety - دليل التكوين والاستخدام

## نظرة عامة

تم إضافة ملف `sheety-sync.js` الذي يقوم بمزامنة الطلبات تلقائياً مع Sheety API. يوفر البرنامج النصي المزايا التالية:

### الميزات الرئيسية:

1. **إرسال الطلبات تلقائياً عند إنشائها** - يتم إرسال الطلب إلى Sheety فور حفظه من النموذج
2. **تحديث الطلبات** - إمكانية تحديث الطلبات الموجودة على Sheety
3. **جلب الطلبات دورياً** - يتم جلب الطلبات من Sheety كل 30 ثانية تلقائياً
4. **تحديثات سريعة عبر البيانات** - دعم تحديث الحالة والدفع عبر سمات `data-sheety-action`
5. **واجهة برمجية عامة** - يمكنك استخدام `window.sheetySync` للعمليات اليدوية

---

## 📝 التكوين المطلوب

### 1. تحديث رابط Sheety

افتح الملف `sheety-sync.js` وابحث عن قسم **CONFIGURATION** (السطر 46):

```javascript
const SHEETY_BASE = 'https://api.sheety.co/984c17c54dafbc5e8fe827b90d39f223/orders';
```

**ملاحظة:** الرابط الحالي جاهز للاستخدام. إذا كنت بحاجة لتغييره، استبدله برابط Sheety الخاص بك.

### 2. إضافة مفتاح التوثيق (Authorization Token) - اختياري

إذا كان Sheety API الخاص بك يتطلب توثيق، قم بإضافة المفتاح في نفس القسم:

```javascript
const SHEETY_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'  // أزل التعليق وأضف المفتاح هنا
};
```

**خطوات الحصول على مفتاح التوثيق:**
1. افتح مشروعك في Sheety
2. اذهب إلى Settings > Authentication
3. انسخ Bearer Token
4. الصقه في الكود أعلاه بدلاً من `YOUR_TOKEN_HERE`

### 3. تطابق أسماء الأعمدة في Google Sheets

**مهم جداً:** يجب أن تتطابق أسماء الأعمدة في Google Sheet مع المفاتيح المستخدمة في الكود.

**الأعمدة المتوقعة في الترتيب (من اليسار إلى اليمين):**

| رقم العمود | الاسم الإنجليزي | الاسم بالعربية (اختياري) |
|------------|------------------|-------------------------|
| A | orderNumber | رقم الطلب |
| B | orderDate | تاريخ الطلب |
| C | customerNumber | رقم العميل |
| D | customerName | اسم العميل |
| E | area | المنطقة |
| F | block | القطعة |
| G | street | الشارع |
| H | houseNumber | رقم المنزل |
| I | floor | الدور |
| J | housingType | نوع السكن |
| K | locationNotes | ملاحظات الموقع |
| L | serviceType | نوع الخدمة |
| M | visitDate | تاريخ المعاينة |
| N | visitTime | وقت المعاينة |
| O | cleaningDate | تاريخ التنظيف |
| P | cleaningTime | وقت التنظيف |
| Q | paymentMethod | طريقة الدفع |
| R | totalAmount | المبلغ الإجمالي |
| S | paymentStatus | حالة الدفع |
| T | bookingStatus | حالة الحجز |
| U | departureTime | وقت المغادرة |
| V | customerNotes | ملاحظات العميل |
| W | teamNotes | ملاحظات الفريق |
| X | customerRating | تقييم العميل |
| Y | ratingNotes | ملاحظات التقييم |
| Z | cancellationReason | سبب الإلغاء |

**إذا كانت أسماء الأعمدة لديك مختلفة:**
1. افتح `sheety-sync.js`
2. ابحث عن دالة `buildOrderPayloadFromForm()` (السطر 62)
3. قم بتحديث أسماء المفاتيح لتتطابق مع أسماء أعمدتك

**مثال:**
```javascript
// إذا كان عمود "اسم العميل" يسمى "customer_full_name" في Sheety:
customerName: document.getElementById('customer-name').value,
// غيره إلى:
customer_full_name: document.getElementById('customer-name').value,
```

### 4. ضبط فترة المزامنة (اختياري)

يمكنك تغيير فترة جلب البيانات من Sheety (الافتراضي 30 ثانية):

```javascript
const POLL_INTERVAL = 30000; // بالميلي ثانية (30000 = 30 ثانية)
```

لتغييرها إلى دقيقة واحدة مثلاً:
```javascript
const POLL_INTERVAL = 60000; // 60 ثانية
```

---

## 🚀 كيفية الاستخدام

### الاستخدام التلقائي

البرنامج النصي يعمل تلقائياً بمجرد تحميل الصفحة:

1. **عند إنشاء طلب جديد:**
   - املأ نموذج الطلب الجديد
   - اضغط "إضافة طلب"
   - سيتم إرسال الطلب تلقائياً إلى Sheety
   - ستجد الطلب مضافاً في Google Sheet

2. **جلب الطلبات تلقائياً:**
   - يتم جلب الطلبات من Sheety كل 30 ثانية
   - يتم تحديث واجهة المستخدم تلقائياً

### الاستخدام اليدوي عبر Console

يمكنك استخدام واجهة البرمجة من Console المتصفح:

```javascript
// إنشاء طلب جديد
await window.sheetySync.createOrderOnSheet({
    order: {
        orderNumber: 123,
        customerName: 'محمد أحمد',
        area: 'السالمية',
        // ... باقي الحقول
    }
});

// تحديث طلب موجود (تحتاج إلى sheety ID)
await window.sheetySync.updateOrderOnSheet(5, {
    paymentStatus: 'مدفوع',
    totalAmount: 50
});

// جلب جميع الطلبات
const orders = await window.sheetySync.fetchOrdersFromSheet();
console.log(orders);
```

### استخدام Data Attributes للتحديثات السريعة

يمكنك إضافة أزرار في واجهة المستخدم للتحديثات السريعة:

```html
<!-- زر لتحديث حالة الطلب -->
<button 
    data-sheety-action="update-status" 
    data-sheety-id="5" 
    data-status="قيد التنفيذ">
    تحديث الحالة
</button>

<!-- زر لتحديث حالة الدفع -->
<button 
    data-sheety-action="update-payment" 
    data-sheety-id="5" 
    data-payment-status="مدفوع">
    تم الدفع
</button>

<!-- زر لتحديث طريقة الدفع -->
<button 
    data-sheety-action="update-payment-method" 
    data-sheety-id="5" 
    data-payment-method="كاش">
    كاش
</button>
```

---

## 🔔 الأحداث المخصصة (Custom Events)

يقوم البرنامج النصي بإطلاق أحداث يمكنك الاستماع إليها:

```javascript
// عند إنشاء طلب جديد
window.addEventListener('sheety:order:created', (e) => {
    console.log('تم إنشاء طلب:', e.detail.order);
});

// عند تحديث طلب
window.addEventListener('sheety:order:updated', (e) => {
    console.log('تم تحديث طلب:', e.detail.order);
});

// عند جلب الطلبات
window.addEventListener('sheety:orders:fetched', (e) => {
    console.log('تم جلب الطلبات:', e.detail.orders);
});
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: لا يتم إرسال الطلبات إلى Sheety

**الحلول:**
1. تأكد من صحة رابط `SHEETY_BASE`
2. افتح Console وتحقق من وجود أخطاء
3. تأكد من أن Sheety API يعمل (اختبره من Postman)
4. تحقق من أن Authorization Token صحيح (إن وُجد)

### المشكلة: أسماء الأعمدة غير متطابقة

**الحل:**
1. افتح Google Sheet وتحقق من أسماء الأعمدة الفعلية
2. افتح `sheety-sync.js` وعدّل `buildOrderPayloadFromForm()`
3. تأكد من أن الأسماء متطابقة تماماً (حساسة لحالة الأحرف)

### المشكلة: CORS Error

**الحل:**
- تأكد من تفعيل CORS في إعدادات Sheety
- في Sheety، اذهب إلى Settings > API
- فعّل "Allow CORS" أو أضف نطاقك في Allowed Origins

### المشكلة: البيانات لا تُحدث في الواجهة

**الحل:**
- تأكد من وجود الدوال `window.renderAllOrders` أو `window.applySheetyOrders`
- أو استمع للحدث `sheety:orders:fetched` وحدّث الواجهة يدوياً

---

## 📋 ملاحظات مهمة

1. **عدم التدخل:** البرنامج النصي لا يعدل على الوظائف الموجودة، بل يضيف طبقة مزامنة فقط
2. **التوافق:** يعمل مع النظام الحالي دون تعارض
3. **الأمان:** لا تشارك Authorization Token في أماكن عامة
4. **الأداء:** المزامنة كل 30 ثانية، يمكنك تعديلها حسب الحاجة
5. **الموثوقية:** في حالة فشل الإرسال، يتم عرض رسالة في Console دون تعطيل النظام

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. افتح Console في المتصفح (F12)
2. ابحث عن رسائل الأخطاء باللون الأحمر
3. تحقق من الإعدادات المذكورة أعلاه
4. راجع وثائق Sheety API

---

**تم التطوير بواسطة:** GitHub Copilot
**التاريخ:** 2025-10-15
**الإصدار:** 1.0.0
