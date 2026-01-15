import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🗑️  Очистка базы данных...')

  try {
    // Удаляем все данные в правильном порядке (из-за связей)
    await prisma.story.deleteMany()
    console.log('✅ Удалены stories')

    await prisma.dealerCar.deleteMany()
    console.log('✅ Удалены dealer cars')

    await prisma.carMedia.deleteMany()
    console.log('✅ Удалены car media')

    await prisma.car.deleteMany()
    console.log('✅ Удалены cars')

    await prisma.user.deleteMany()
    console.log('✅ Удалены users')

    await prisma.dealer.deleteMany()
    console.log('✅ Удалены dealers')

    console.log('🎉 База данных успешно очищена!')
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
