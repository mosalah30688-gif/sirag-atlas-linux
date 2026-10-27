<div align="center">

<img src="assets/icon-512.png" alt="سراج أطلس السيرة النبوية" width="148" style="border-radius:32px;" />

# 🕌 سراج أطلس السيرة النبوية ﷺ
### واجهة سطح مكتب لينكس الأصلية المستقلة (`Pure Native Qt 6 GUI — AppImage`)

**تطبيق سطح مكتب أصلي 100% لنظام لينكس (بدون Electron • بدون متصفح • بدون WebView) يعمل بالكامل أوفلاين**

[![Download Native AppImage](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F_%D8%AA%D8%AD%D9%85%D9%8A%D9%84_%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D8%A9_%D8%A7%D9%84%D8%A3%D8%B5%D9%84%D9%8A%D8%A9_%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%82%D9%84%D8%A9-Native_Qt6_AppImage_(v2.0.0)-d4af37?style=for-the-badge&logo=qt&logoColor=060a11)](https://github.com/mosalah30688-gif/sirag-atlas-linux/releases/latest/download/Sirag-Atlas-Seerah-x86_64.AppImage)
[![Developer](https://img.shields.io/badge/%E2%9C%A8_%D8%AA%D9%85_%D8%A7%D9%84%D8%AA%D8%B7%D9%88%D9%8A%D8%B1_%D8%A8%D9%88%D8%A7%D8%B3%D8%B7%D8%A9-%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D9%82-1e293b?style=for-the-badge)](https://elkatebmohamadsalah.blogspot.com/?m=1#google_vignette)

</div>

---

## 🖥️ لماذا هذه النسخة مختلفة وجذرية؟

- **واجهة رسومية أصلية 100% (`Pure Native Qt 6 Widgets + QPainter`):** لا تستخدم Electron ولا Chromium ولا أي متصفح خارجي أو داخلي على الإطلاق!
- **توافق شامل مع X11 و Wayland:** مبنية على `Ubuntu 22.04 LTS` مع تضمين جميع مكتبات `Qt6` و `XCB` والخطوط العربية الأصيلة (`Amiri` و `Readex Pro`) داخل ملف الـ `AppImage` نفسه لتعمل فوراً على جميع توزيعات لينكس (Ubuntu, Debian, Linux Mint, Fedora, Arch, Manjaro, Kali, Zorin, Pop!_OS).
- **محرك رسم تفاعلي 60 إطاراً/ثانية (`QPainter`):** يرسم خريطة الجزيرة العربية الفلكية المذهبة بنبض المحطات ومسارات الهجرة، ومحاكي الغزوات التكتيكي المتحرك، والمخطط الهندسي للحرمين، ومجرة الصحابة، وعمود النسب النبوي، ويصدّر البطاقات الذهبية وشهادات الختمة بدقة `1600×1120 PNG` مباشرة.

---

## ⚡ التحميل والتشغيل الفوري

1. حمّل الملف الجاهز مباشرة من زر التحميل أعلاه أو من قسم [**Releases (`v2.0.0`)**](https://github.com/mosalah30688-gif/sirag-atlas-linux/releases/latest):
   - [**`Sirag-Atlas-Seerah-x86_64.AppImage`**](https://github.com/mosalah30688-gif/sirag-atlas-linux/releases/latest/download/Sirag-Atlas-Seerah-x86_64.AppImage)

2. شغّله فوراً بدبل-كليك من مدير الملفات (بعد تفعيل صلاحية التشغيل) أو عبر الطرفية:
   ```bash
   chmod +x Sirag-Atlas-Seerah-x86_64.AppImage
   ./Sirag-Atlas-Seerah-x86_64.AppImage
   ```
   > *ملاحظة لتوزيعات Ubuntu 22.04 / 24.04 إن لم تكن مكتبة `libfuse2` مثبتة على نظامك لتشغيل صيغة AppImage عموماً:*
   > ثبتها مرة واحدة بـ `sudo apt install libfuse2t64` (أو `sudo apt install libfuse2`)، أو شغّل التطبيق مباشرة بدون FUSE عبر:
   > `./Sirag-Atlas-Seerah-x86_64.AppImage --appimage-extract-and-run`

---

## 🛠️ التشغيل أو البناء من السورس مباشرة

```bash
git clone https://github.com/mosalah30688-gif/sirag-atlas-linux.git
cd sirag-atlas-linux
pip install -r requirements.txt
python3 main.py                        # تشغيل الواجهة الأصلية مباشرة من السورس
bash scripts/build-native-appimage.sh  # بناء ملف AppImage مستقل في مجلد dist/
```

---

<div align="center">

**✨ تم التطوير بواسطة [محمد صلاح عبد الخالق](https://elkatebmohamadsalah.blogspot.com/?m=1#google_vignette)**

</div>
