import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Создаем супер-админа
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const superAdmin = await prisma.user.upsert({
    where: { phone: '+77001234567' },
    update: {
      email: 'admin@dalacar.kz',
      password: hashedPassword,
    },
    create: {
      phone: '+77001234567',
      email: 'admin@dalacar.kz',
      password: hashedPassword,
      name: 'Супер Админ',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Создан супер-админ:', superAdmin.phone, '/', superAdmin.email)

  // Создаем дилера
  let dealer = await prisma.dealer.findFirst({
    where: { phone: '+77272123456' },
  })

  if (!dealer) {
    dealer = await prisma.dealer.create({
      data: {
        name: 'DalaCar Almaty',
        description: 'Официальный дилер премиальных автомобилей',
        address: 'пр. Аль-Фараби, 77, Алматы',
        phone: '+77272123456',
        email: 'almaty@dalacar.kz',
        isActive: true,
      },
    })
  }
  console.log('✅ Создан дилер:', dealer.name)

  // Создаем админа дилера
  const dealerAdmin = await prisma.user.upsert({
    where: { phone: '+77051234567' },
    update: {
      email: 'dealer@dalacar.kz',
      password: hashedPassword,
      dealerId: dealer.id,
    },
    create: {
      phone: '+77051234567',
      email: 'dealer@dalacar.kz',
      password: hashedPassword,
      name: 'Админ Дилера',
      role: 'DEALER_ADMIN',
      dealerId: dealer.id,
    },
  })
  console.log('✅ Создан админ дилера:', dealerAdmin.phone, '/', dealerAdmin.email)

  // Создаем менеджера
  const manager = await prisma.user.upsert({
    where: { phone: '+77011234567' },
    update: {
      email: 'manager@dalacar.kz',
      password: hashedPassword,
      dealerId: dealer.id,
    },
    create: {
      phone: '+77011234567',
      email: 'manager@dalacar.kz',
      password: hashedPassword,
      name: 'Менеджер Асан',
      role: 'MANAGER',
      dealerId: dealer.id,
    },
  })
  console.log('✅ Создан менеджер:', manager.name, '/', manager.email)

  // Создаем автомобиль Zeekr 001
  let zeekr = await prisma.car.findFirst({
    where: { brand: 'Zeekr', model: '001', year: 2024 },
  })

  if (!zeekr) {
    zeekr = await prisma.car.create({
      data: {
        brand: 'Zeekr',
        model: '001',
        year: 2024,
        bodyType: 'SEDAN',
        engine: '2x электромотор',
        transmission: 'AUTOMATIC',
        drive: 'AWD',
        power: 544,
        acceleration: 3.8,
        fuelConsumption: 0,
        seatingCapacity: 5,
        trunkVolume: 539,
        color: 'Белый',
        interiorColor: 'Черный',
        features: [
          'Автопилот уровня 2',
          'Панорамная крыша',
          'Премиум аудиосистема',
          'Массаж сидений',
          'Адаптивная подвеска',
        ],
      },
    })
  }
  console.log('✅ Создан автомобиль:', zeekr.brand, zeekr.model)

  // Фото для Zeekr
  const zeekrMediaCount = await prisma.carMedia.count({
    where: { carId: zeekr.id },
  })

  if (zeekrMediaCount === 0) {
    await prisma.carMedia.createMany({
      data: [
        {
          carId: zeekr.id,
          url: 'https://www.datocms-assets.com/128969/1744198973-001-pad-mobile1.png?auto=format',
          type: 'IMAGE',
          isPrimary: true,
          order: 0,
        },
        {
          carId: zeekr.id,
          url: 'https://ecofactortech.com/wp-content/uploads/2025/10/zeekr-0013.jpg',
          type: 'IMAGE',
          isPrimary: false,
          order: 1,
        },
      ],
    })
  }

  // Создаем автомобиль Li Auto L9
  let li = await prisma.car.findFirst({
    where: { brand: 'Li Auto', model: 'L9', year: 2024 },
  })

  if (!li) {
    li = await prisma.car.create({
      data: {
        brand: 'Li Auto',
        model: 'L9',
        year: 2024,
        bodyType: 'SUV',
        engine: '1.5T + электромотор',
        transmission: 'AUTOMATIC',
        drive: 'AWD',
        power: 449,
        acceleration: 5.3,
        fuelConsumption: 7.8,
        seatingCapacity: 6,
        trunkVolume: 357,
        color: 'Серый',
        interiorColor: 'Бежевый',
        features: [
          'Холодильник',
          'Массаж второго ряда',
          '3D-экран',
          'Премиум аудиосистема',
          'Адаптивный круиз-контроль',
        ],
      },
    })
  }
  console.log('✅ Создан автомобиль:', li.brand, li.model)

  // Фото для Li Auto
  const liMediaCount = await prisma.carMedia.count({
    where: { carId: li.id },
  })

  if (liMediaCount === 0) {
    await prisma.carMedia.createMany({
      data: [
        {
          carId: li.id,
          url: 'https://avatars.mds.yandex.net/get-verba/1030388/2a0000019601345dabb633e9becc2b3835ac/cattouchretcr',
          type: 'IMAGE',
          isPrimary: true,
          order: 0,
        },
        {
          carId: li.id,
          url: 'https://pl.ml-vehicle.com/uploads/202338258/lixiang-l9-proe6346c8e-2cc9-4248-adda-0666117c3c96.jpg',
          type: 'IMAGE',
          isPrimary: false,
          order: 1,
        },
      ],
    })
  }

  // Добавляем Zeekr в продажу у дилера
  const zeekrDealerCar = await prisma.dealerCar.findFirst({
    where: { dealerId: dealer.id, carId: zeekr.id },
  })

  if (!zeekrDealerCar) {
    await prisma.dealerCar.create({
      data: {
        dealerId: dealer.id,
        carId: zeekr.id,
        price: 31500000,
        inStock: true,
        specialOffer: false,
      },
    })
    console.log('✅ Zeekr 001 добавлен в продажу у дилера')
  }

  // Добавляем Li в продажу у дилера
  const liDealerCar = await prisma.dealerCar.findFirst({
    where: { dealerId: dealer.id, carId: li.id },
  })

  if (!liDealerCar) {
    await prisma.dealerCar.create({
      data: {
        dealerId: dealer.id,
        carId: li.id,
        price: 27500000,
        inStock: true,
        specialOffer: true,
      },
    })
    console.log('✅ Li Auto L9 добавлен в продажу у дилера')
  }

  // Создаем story для дилера
  const storyCount = await prisma.story.count({
    where: { dealerId: dealer.id },
  })

  if (storyCount === 0) {
    await prisma.story.create({
      data: {
        dealerId: dealer.id,
        mediaUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
        mediaType: 'IMAGE',
        duration: 5,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      },
    })
    console.log('✅ Создан story для дилера')
  }

  console.log('🎉 База данных успешно заполнена!')
  console.log('')
  console.log('📧 Учетные данные для входа:')
  console.log('Супер-админ: admin@dalacar.kz / admin123')
  console.log('Админ дилера: dealer@dalacar.kz / admin123')
  console.log('Менеджер: manager@dalacar.kz / admin123')
  console.log('')
  console.log('Для авторизации клиента используйте любой номер +77XXXXXXXXX и код: 1234')
  console.log('')
  console.log('🔗 Ссылка для входа менеджера: http://localhost:3000/auth/admin-login')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
