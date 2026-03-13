# Newsletter Management System

نظام إدارة النشرات البريدية البسيط - بدون تحقق من البريد الإلكتروني

## الميزات

✅ **اشتراك مباشر** - العملاء يدخلون بريدهم فقط ويتم حفظه مباشرة
✅ **إدارة من لوحة التحكم** - عرض جميع المشتركين والبيانات الكاملة
✅ **تصدير البيانات** - تصدير إلى CSV و Excel
✅ **حذف المشتركين** - إزالة المشتركين من النظام
✅ **البحث والتصفية** - ابحث عن مشتركين معينين أو صفهم حسب الحالة

## ملفات النظام

### قاعدة البيانات

- **جدول `newsletter_subscribers`**:
  - `id` - معرف فريد
  - `email` - البريد الإلكتروني (فريد)
  - `is_active` - حالة الاشتراك (نشط/غير نشط)
  - `ip_address` - عنوان IP للمشترك
  - `user_agent` - متصفح المشترك
  - `created_at` - تاريخ الاشتراك

### Backend

#### Model: `NewsletterSubscriber.php`

```php
// دوال مهمة:
- findByEmail($email) - البحث عن مشترك
- getAll($filters) - الحصول على جميع المشتركين
- getActiveCount() - عدد المشتركين النشطين
- getInactiveCount() - عدد المشتركين غير النشطين
- export($limit, $offset) - تصدير البيانات
```

#### Controller: `NewsletterController.php`

```php
// النقاط النهائية:
- subscribe() - اشتراك جديد (عام)
- unsubscribe() - إلغاء الاشتراك (عام)
- getAll() - الحصول على جميع المشتركين (إدارة)
- getById($id) - الحصول على مشترك محدد (إدارة)
- delete($id) - حذف مشترك (إدارة)
- export() - تصدير CSV (إدارة)
- exportExcel() - تصدير Excel (إدارة)
```

### API Routes

```php
// عام (بدون تحقق)
POST   /api/newsletter/subscribe    - اشتراك جديد
POST   /api/newsletter/unsubscribe  - إلغاء الاشتراك

// الإدارة (يتطلب تفويض إداري)
GET    /api/admin/newsletter                    - الحصول على جميع المشتركين
GET    /api/admin/newsletter/{id}               - الحصول على مشترك محدد
DELETE /api/admin/newsletter/{id}               - حذف مشترك
POST   /api/admin/newsletter/export-csv         - تصدير CSV
POST   /api/admin/newsletter/export-excel       - تصدير Excel
```

### Frontend

#### API Service: `newsletter.js`

```javascript
// دوال العميل:
- subscribe(email) - الاشتراك
- unsubscribe(email) - إلغاء الاشتراك
- getAllSubscribers(params) - الحصول على جميع المشتركين
- getSubscriberById(id) - الحصول على مشترك محدد
- deleteSubscriber(id) - حذف مشترك
- exportCSV(params) - تصدير CSV
- exportExcel(params) - تصدير Excel
```

#### React Component: `NewsletterManagement.jsx`

- صفحة إدارة النشرات في لوحة التحكم
- عرض إحصائيات (إجمالي، نشط، غير نشط)
- بحث وتصفية
- حذف المشتركين
- تصدير البيانات

#### React Component: `Newsletter.jsx`

- نموذج الاشتراك في الصفحة الرئيسية
- رسائل النجاح والخطأ
- معالجة الأخطاء

## كيفية الاستخدام

### للعملاء (الاشتراك)

1. أدخل بريدك الإلكتروني في نموذج Newsletter
2. اضغط الزر "Join"
3. سيتم حفظ بريدك مباشرة وستتلقى رسالة تأكيد

### للمسؤولين (إدارة النشرات)

1. اذهب إلى **Dashboard → Newsletter**
2. اعرض قائمة المشتركين
3. ابحث أو صفهم حسب الحالة
4. احذف المشتركين إذا لزم الأمر
5. صدّر البيانات إلى CSV أو Excel

## التثبيت

1. **إنشاء الجدول**:

```sql
-- تشغيل ملف إنشاء الجدول
source backend/database/create_newsletter_table.sql;
```

2. **تفعيل في قاعدة البيانات**:

- زر الزر على `http://localhost/ESC_Wear/backend/database/setup_newsletter_table.php`

3. **النقاط النهائية جاهزة**:

- `POST /api/newsletter/subscribe` - جاهز للاستخدام

## البيانات المُصدَّرة

عند تصدير CSV أو Excel، ستحصل على:

- Email
- Subscribed Date

## ملاحظات مهمة

⚠️ **لا يوجد تحقق من البريد الإلكتروني** - الاشتراك مباشر
⚠️ **الرسائل البريدية** - يجب إضافة نظام إرسال البريد منفصل
⚠️ **الخصوصية** - تأكد من موافقة المستخدمين على سياسة البيانات

## التطور المستقبلي

- [ ] إضافة نظام إرسال الرسائل البريدية
- [ ] قوالب رسائل مخصصة
- [ ] جدولة الرسائل
- [ ] تحليلات الفتح والنقر
- [ ] تقسيم المشتركين إلى مجموعات
