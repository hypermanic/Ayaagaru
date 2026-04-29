'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiBook, FiSun, FiHome, FiBookOpen } from 'react-icons/fi';

interface ServiceCard {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  ritualKeys?: string[];
}

const ServicesSection: React.FC = () => {
  const { t } = useTranslation();

  const services: ServiceCard[] = [
    {
      id: 'poojas',
      titleKey: 'service_poojas',
      descKey: 'service_poojas_desc',
      icon: <FiBook className="w-8 h-8" />,
      ritualKeys: ['ritual_ganesh', 'ritual_satyanarayana', 'ritual_lakshmi'],
    },
    {
      id: 'homams',
      titleKey: 'service_homams',
      descKey: 'service_homams_desc',
      icon: <FiSun className="w-8 h-8" />,
      ritualKeys: ['ritual_navagraha', 'ritual_sudarshana', 'ritual_rudra'],
    },
    {
      id: 'samskaras',
      titleKey: 'service_samskaras',
      descKey: 'service_samskaras_desc',
      icon: <FiHome className="w-8 h-8" />,
      ritualKeys: ['ritual_housewarming', 'ritual_wedding', 'ritual_naming'],
    },
    {
      id: 'karmakanda',
      titleKey: 'service_karmakanda',
      descKey: 'service_karmakanda_desc',
      icon: <FiBookOpen className="w-8 h-8" />,
      ritualKeys: ['ritual_shraddha', 'ritual_pitru', 'ritual_tarpanam', 'ritual_annual']
    }
  ];

  return (
    <section className="py-8 md:py-12 px-4 bg-secondary-ivory">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <h2 className="font-headings text-2xl md:text-3xl text-primary-deepBlue mb-2">
            {t('services_title')}
          </h2>
          <p className="font-body text-secondary-earthBrown text-sm">
            {t('services_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-card hover:shadow-lg transition-shadow p-4"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary-saffron rounded-full mb-3 mx-auto">
                <div className="text-white [&>svg]:w-5 [&>svg]:h-5">{service.icon}</div>
              </div>

              <h3 className="font-headings text-base text-primary-deepBlue text-center mb-1">
                {t(service.titleKey)}
              </h3>

              <p className="font-body text-secondary-earthBrown text-center text-xs mb-3">
                {t(service.descKey)}
              </p>

              {service.ritualKeys && (
                <ul className="mb-3 space-y-1">
                  {service.ritualKeys.map((ritualKey, idx) => (
                    <li
                      key={idx}
                      className="font-body text-xs text-secondary-earthBrown flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-primary-saffron rounded-full mr-2 shrink-0"></span>
                      {t(ritualKey)}
                    </li>
                  ))}
                </ul>
              )}              
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
