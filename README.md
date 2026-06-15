# Інтерактивний Бланк-Редактор

Сучасний React + TypeScript застосунок для створення та редагування офіційних документів з інтерактивними полями, малюванням від руки та експортом у автономний HTML.

## Можливості

- **Шаблони документів**: довіреність, заява, договір, порожній бланк
- **Інтерактивні поля**: автоматично створюються з `_____` у тексті
- **Малювання від руки**: canvas 800×1130, плавні лінії, 4 кольори, товщина 1–10 px
- **Зображення**: підпис, печатка, логотип — завантаження, перетягування, зміна розміру, `mix-blend-mode: multiply`
- **Шапка документа**: назва, підзаголовок, місто, дата, кругла емблема
- **Експорт**: автономний HTML-файл без React та інтернету

## Запуск

```bash
npm install
npm run dev
```

## Збірка

```bash
npm run build
```

## Деплой на GitHub Pages

Сайт доступний за адресою: `https://metra5360.github.io/document/`

1. У репозиторії: **Settings → Pages → Build and deployment → Source** → оберіть **GitHub Actions** (не «Deploy from branch»).
2. Закомітьте та запуште зміни — workflow `.github/workflows/deploy.yml` автоматично збере проєкт і опублікує папку `dist`.

Локальна перевірка збірки для GitHub Pages:

```bash
npm run build
npm run preview
```


## Структура проєкту

```
src/
├── components/
│   ├── ControlPanel/     # Ліва панель керування
│   ├── DocumentSheet/    # Аркуш A4
│   ├── DocumentHeader/   # Шапка документа
│   ├── InteractiveText/  # Текст з полями
│   ├── DrawingCanvas/    # Canvas для малювання
│   └── PlacedImageLayer/ # Шар зображень
├── data/templates.ts     # Шаблони документів
├── hooks/                # React-хуки
├── types/                # TypeScript типи
└── utils/                # Парсер тексту, експорт HTML
```
