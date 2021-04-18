# Awersome egrls

Для запуска проекта необходима предустановленная версия nodejs v14.15.5.

Реализованная функциональность:

- после запуска для всех docId в файле src/docs.json закачивается базовая информация `regNum, regId, tradeName, docId` о вакцине с сайта http://grls.rosminzdrav.ru
- в файловой структуре сохраняются все связанные pdf файлы в директорию `./data/{Url}`, где Url это часть ссылки на файл на сайте минздрава

Что не сделано:

- Распознавание текста из пдф
- Механизм определения ченжлога версий
- Фронтенд

## Installation

Для загрузки необходимых библиотек выполнить

```bash
npm i
```

## Usage

Для запуска выполнить

```bash
npm run start
```

## Обработка полученного датасета ведется в

* https://colab.research.google.com/drive/1c18KQgUThQPzIlvjZuJc47lKJwmiNaYR#scrollTo=B6VYQADEf4Vp
* https://colab.research.google.com/drive/1F5gaoYlRYpaq8vz0RawBF_99qbwICI6y#scrollTo=RzM9w9tF0J5w

## Старый репозиторий

https://github.com/wooferclaw/GRLS-parser

## License

[MIT](https://choosealicense.com/licenses/mit/)
