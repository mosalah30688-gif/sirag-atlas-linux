import json
import os
import sys
import datetime
from pathlib import Path


def resource_path(rel_path: str) -> str:
    """Resolve bundled asset path in both source mode and PyInstaller AppImage binary."""
    base = getattr(sys, "_MEIPASS", os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    return os.path.join(base, rel_path)


HIJRI_MONTHS_AR = [
    "محرّم", "صفر", "ربيع الأول", "ربيع الآخر",
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
    "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"
]


def gregorian_to_hijri(dt: datetime.date = None):
    """Accurate tabular/astronomical Hijri conversion returning (day, month_num, year, formatted_ar)."""
    if dt is None:
        dt = datetime.date.today()
    jd = dt.toordinal() + 1721425
    l = jd - 1948440 + 10632
    n = (l - 1) // 10631
    l = l - 10631 * n + 354
    j = ((10985 - l) // 5316) * ((50 * l) // 17719) + (l // 5670) * ((43 * l) // 15238)
    l = l - ((30 - j) // 15) * ((17719 * j) // 50) - (j // 16) * ((15238 * j) // 43) + 29
    month = (24 * l) // 709
    day = l - (709 * month) // 24
    year = 30 * n + j - 30
    month = max(1, min(12, month))
    month_name = HIJRI_MONTHS_AR[month - 1]
    return day, month, year, f"{day} {month_name} {year} هـ"


class DataRepository:
    """Loads all 11 authenticated Prophetic Seerah datasets offline from bundled JSON."""

    def __init__(self):
        self.events = self._load_json("events.json")
        self.hijrah_data = self._load_json("hijrah_data.json")
        self.battles = self._load_json("battles.json")
        self.sanctuaries = self._load_json("sanctuaries.json")
        self.scenarios = self._load_json("scenarios.json")
        self.companions = self._load_json("companions.json")
        self.lineage = self._load_json("lineage.json")
        self.diwan_lexicon = self._load_json("diwan_lexicon.json")
        self.guidance = self._load_json("guidance.json")
        self.relics = self._load_json("relics.json")
        self.khatmah_days = self._load_json("khatmah_days.json")

    def _load_json(self, filename: str):
        p = resource_path(os.path.join("assets", "data", filename))
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)


class UserState:
    """Persists explorer mastery, bookmarks, Khatmah councils, quiz medals & preferences."""

    def __init__(self, repo: DataRepository):
        self.repo = repo
        self.config_dir = Path.home() / ".config" / "sirag-atlas"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.state_file = self.config_dir / "user_state.json"
        self.data = self._load()
        self._listeners = []

    def _default_state(self):
        return {
            "theme": "night",
            "font_scale": "normal",
            "ambiance_type": "desert",
            "auto_update_notify": True,
            "reader_name": "",
            "stations": [],
            "battles": [],
            "scenarios": [],
            "companions": [],
            "relics": [],
            "bookmarks": [],
            "sunnah_done": [],
            "khatmah_done": [],
            "quiz_solved": []
        }

    def _load(self):
        base = self._default_state()
        if self.state_file.exists():
            try:
                loaded = json.loads(self.state_file.read_text(encoding="utf-8"))
                if isinstance(loaded, dict):
                    base.update(loaded)
            except Exception:
                pass
        return base

    def save(self):
        try:
            self.state_file.write_text(
                json.dumps(self.data, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
        except Exception:
            pass
        for cb in self._listeners:
            try:
                cb()
            except Exception:
                pass

    def on_change(self, callback):
        self._listeners.append(callback)

    def add_unique(self, key: str, item_id):
        lst = self.data.setdefault(key, [])
        if item_id not in lst:
            lst.append(item_id)
            self.save()

    def toggle_in_list(self, key: str, item_id) -> bool:
        lst = self.data.setdefault(key, [])
        if item_id in lst:
            lst.remove(item_id)
            present = False
        else:
            lst.append(item_id)
            present = True
        self.save()
        return present

    def mastery_stats(self):
        total = (
            len(self.repo.events)
            + len(self.repo.battles)
            + len(self.repo.scenarios)
            + len(self.repo.companions)
            + len(self.repo.relics)
        )
        done = (
            len(self.data.get("stations", []))
            + len(self.data.get("battles", []))
            + len(self.data.get("scenarios", []))
            + len(self.data.get("companions", []))
            + len(self.data.get("relics", []))
        )
        pct = min(100, round((done / max(1, total)) * 100))
        return pct, done, total
