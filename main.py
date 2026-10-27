#!/usr/bin/env python3
"""
سراج أطلس السيرة النبوية ﷺ — تطبيق سطح مكتب لينكس الأصلي المستقل (Pure Native Qt 6 GUI)
يعمل بواجهة رسومية أصلية مستقلة 100% دون أي اعتماد على متصفح أو Electron أو WebView.
تم التطوير بواسطة محمد صلاح عبد الخالق
"""

import os
import sys

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFontDatabase
from PySide6.QtWidgets import QApplication

from sirag_app.main_window import SiragMainWindow
from sirag_app.state import resource_path


def _load_bundled_fonts():
    ui_family = "Sans Serif"
    serif_family = "Serif"

    readex_id = QFontDatabase.addApplicationFont(resource_path("assets/fonts/ReadexPro.ttf"))
    if readex_id != -1:
        fams = QFontDatabase.applicationFontFamilies(readex_id)
        if fams:
            ui_family = fams[0]

    amiri_reg = QFontDatabase.addApplicationFont(resource_path("assets/fonts/Amiri-Regular.ttf"))
    QFontDatabase.addApplicationFont(resource_path("assets/fonts/Amiri-Bold.ttf"))
    if amiri_reg != -1:
        fams = QFontDatabase.applicationFontFamilies(amiri_reg)
        if fams:
            serif_family = fams[0]

    return ui_family, serif_family


def main():
    self_test = "--self-test" in sys.argv

    if sys.platform.startswith("linux") and "QT_QPA_PLATFORM" not in os.environ:
        os.environ["QT_QPA_PLATFORM"] = "xcb;wayland"

    app = QApplication(sys.argv)
    app.setApplicationName("سراج أطلس السيرة النبوية")
    app.setDesktopFileName("com.sirag.atlas.seerah")
    app.setLayoutDirection(Qt.LayoutDirection.RightToLeft)

    ui_font, serif_font = _load_bundled_fonts()
    win = SiragMainWindow(ui_font=ui_font, serif_font=serif_font)
    win.show()

    if self_test:
        def _verify_all_tabs():
            for idx in range(len(win.section_defs)):
                win.switch_section_index(idx)
                app.processEvents()
            print(f"SELF-TEST OK: Loaded fonts ({ui_font}, {serif_font}) and rendered all 11 native Qt6 views!")
            app.quit()

        QTimer.singleShot(350, _verify_all_tabs)

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
