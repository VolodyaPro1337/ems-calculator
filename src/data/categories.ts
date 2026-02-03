import type { Category } from '@/types'

export const categoriesData: Category[] = [
  {
    id: 'pills',
    name: 'Выдача таблеток',
    icon: 'Pill',
    color: 'text-rose-400',
    isOpen: false,
    items: [
      { name: 'Выдача таблетки в ELSH День', points: 1, quantity: 0 },
      { name: 'Выдача таблетки в ELSH Ночь', points: 2, quantity: 0 },
      { name: 'Выдача таблетки в Sandy Shores День', points: 3, quantity: 0 },
      { name: 'Выдача таблетки в Sandy Shores Ночь', points: 4, quantity: 0 },
      { name: 'Выдача таблетки в Paleto Bay День', points: 3, quantity: 0 },
      { name: 'Выдача таблетки в Paleto Bay Ночь', points: 4, quantity: 0 },
    ]
  },
  {
    id: 'vaccination',
    name: 'Вакцинация',
    icon: 'Syringe',
    color: 'text-cyan-400',
    isOpen: false,
    items: [
      { name: 'Вакцинация в ELSH День', points: 2, quantity: 0 },
      { name: 'Вакцинация в ELSH Ночь', points: 3, quantity: 0 },
      { name: 'Вакцинация в Sandy Shores День', points: 4, quantity: 0 },
      { name: 'Вакцинация в Sandy Shores Ночь', points: 6, quantity: 0 },
      { name: 'Вакцинация в Paleto Bay День', points: 4, quantity: 0 },
      { name: 'Вакцинация в Paleto Bay Ночь', points: 6, quantity: 0 },
    ]
  },
  {
    id: 'certificates',
    name: 'Мед. справки',
    icon: 'FileText',
    color: 'text-amber-400',
    isOpen: false,
    items: [
      { name: 'Выдача 1 мед. справки в ELSH День', points: 3, quantity: 0 },
      { name: 'Выдача 1 мед. справки в ELSH Ночь', points: 4, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Sandy Shores День', points: 5, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Sandy Shores Ночь', points: 6, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Paleto Bay День', points: 5, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Paleto Bay Ночь', points: 6, quantity: 0 },
    ]
  },
  {
    id: 'firstaid',
    name: 'ПМП и вызовы',
    icon: 'Ambulance',
    color: 'text-red-400',
    isOpen: false,
    items: [
      { name: 'Оказание ПМП День', points: 4, quantity: 0 },
      { name: 'Оказание ПМП Ночь', points: 6, quantity: 0 },
      { name: 'ПМП с интерном День', points: 1, quantity: 0 },
      { name: 'ПМП с интерном Ночь', points: 1, quantity: 0 },
      { name: 'Отмена ПМП', points: 1, quantity: 0 },
      { name: 'Выдача таблетка на выезде ПМП День', points: 1, quantity: 0 },
      { name: 'Выдача таблетка на выезде ПМП Ночь', points: 2, quantity: 0 },
      { name: 'Вакцинация на выезде ПМП День', points: 3, quantity: 0 },
      { name: 'Вакцинация на выезде ПМП Ночь', points: 5, quantity: 0 },
    ]
  },
  {
    id: 'patrols',
    name: 'Дежурства (30 мин)',
    icon: 'Clock',
    color: 'text-violet-400',
    isOpen: false,
    items: [
      { name: 'ELSH День', points: 5, quantity: 0 },
      { name: 'ELSH Ночь', points: 8, quantity: 0 },
      { name: 'Сенди Шорс День', points: 8, quantity: 0 },
      { name: 'Сенди Шорс Ночь', points: 14, quantity: 0 },
      { name: 'Палето-Бей День', points: 8, quantity: 0 },
      { name: 'Палето-Бей Ночь', points: 14, quantity: 0 },
      { name: 'Дежурство ПМП День', points: 5, quantity: 0 },
      { name: 'Дежурство ПМП Ночь', points: 10, quantity: 0 },
    ]
  },
  {
    id: 'events',
    name: 'Мероприятия',
    icon: 'PartyPopper',
    color: 'text-emerald-400',
    isOpen: false,
    isManual: true,
    items: [
      { name: 'СУММА ВСЕХ МП', points: 1, quantity: 0, isRawPoints: true },
    ]
  },
  {
    id: 'highcommand',
    name: 'Старший состав',
    icon: 'ClipboardList',
    color: 'text-indigo-400',
    isOpen: false,
    items: [
      { name: 'Проверка отчёта на повышение', points: 25, quantity: 0 },
      { name: 'Проверка дежурства', points: 10, quantity: 0 },
      { name: 'Подача госволны', points: 15, quantity: 0 },
    ]
  },
]
