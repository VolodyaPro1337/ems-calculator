<script setup lang="ts">
import { X, BookOpen, GraduationCap, ArrowRightLeft } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const levels = [
  { from: 3, to: 4, items: ['Оказать 40 ПМП', 'Провести 3 вакцинации', 'Набрать суммарно 300 баллов'] },
  { from: 4, to: 5, items: ['Оказать 55 ПМП', 'Провести 5 вакцинаций', 'Сдать экзамен по мед.справкам', 'Набрать суммарно 380 баллов'] },
  { from: 5, to: 6, items: ['Оказать 75 ПМП', 'Провести 7 вакцинаций', '1,5 часа на дежурстве', 'Набрать суммарно 460 баллов'] },
  { from: 6, to: 7, items: ['Оказать 90 ПМП', 'Провести 9 вакцинаций', '2 часа на дежурстве', 'Набрать суммарно 540 баллов'] },
  { from: 7, to: 8, items: ['Оказать 110 ПМП', 'Провести 10 вакцинаций', '2,5 часа на дежурстве', 'Набрать суммарно 600 баллов'] },
  { from: 8, to: 9, items: ['Оказать 120 ПМП', 'Провести 12 вакцинаций', '3 часа на дежурстве', 'Набрать суммарно 660 баллов'] },
  { from: 9, to: 10, items: ['Оказать 150 ПМП', 'Провести 14 вакцинаций', '3 часа на дежурстве', 'Набрать суммарно 720 баллов'] },
]

const replacements = [
  { from: '3 ПМП', to: '1 вакцина' },
  { from: '2 справки', to: '1 вакцина' },
  { from: '15 таблеток', to: '1 вакцина' },
]
</script>

<template>
  <!-- Backdrop -->
  <div v-if="modelValue" @click="emit('update:modelValue', false)" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"></div>

  <!-- Sidebar -->
  <Transition 
    enter-active-class="transition ease-out duration-300" 
    enter-from-class="transform translate-x-full" 
    enter-to-class="transform translate-x-0" 
    leave-active-class="transition ease-in duration-300" 
    leave-from-class="transform translate-x-0" 
    leave-to-class="transform translate-x-full"
  >
    <div v-if="modelValue" class="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#151C2C] border-l border-white/10 shadow-2xl z-[70] p-6 flex flex-col overflow-hidden">
      <div class="flex items-center justify-between mb-6 shrink-0">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <GraduationCap class="w-5 h-5 text-amber-400" />
          Система повышения
        </h2>
        <button @click="emit('update:modelValue', false)" class="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-8 pr-2 -mr-2 pb-20 text-sm">
        <p class="text-xs text-slate-400 italic bg-white/5 p-4 rounded-xl border border-white/5">
          Отчёт на повышение включает обязательный минимум по разным категориям задач. Когда минимум выполнен, допускается добор итоговых баллов любыми доступными задачами по вашему выбору.
        </p>

        <div class="space-y-4">
          <div v-for="lvl in levels" :key="lvl.to" class="bg-[#0B1120] rounded-2xl p-4 border border-white/5">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-lg font-bold">{{ lvl.from }}</span>
              <BookOpen class="w-3 h-3 text-slate-600" />
              <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">{{ lvl.to }}</span>
            </div>
            <ul class="space-y-2">
              <li v-for="(item, idx) in lvl.items" :key="idx" class="flex items-start gap-2 text-slate-300 leading-snug">
                <span class="text-indigo-500 font-bold mt-0.5">•</span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-bold text-white flex items-center gap-2">
            <ArrowRightLeft class="w-4 h-4 text-rose-400" />
            Система замен
          </h3>
          <div class="bg-[#0B1120] rounded-2xl p-4 border border-rose-500/10 space-y-3">
            <div v-for="rep in replacements" :key="rep.from" class="flex items-center justify-between text-xs">
              <span class="text-slate-400">{{ rep.from }}</span>
              <span class="text-rose-400 font-black">➜</span>
              <span class="text-emerald-400 font-bold">{{ rep.to }}</span>
            </div>
            <p class="text-[10px] text-rose-500/60 font-bold italic pt-2 border-t border-white/5">
              *Действует лишь на замену вакцинаций
            </p>
          </div>
        </div>
      </div>


    </div>
  </Transition>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 2px;
}
</style>
