import { motion } from 'framer-motion'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { FiCheck, FiX } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    description: 'Perfeito para começar',
    features: [
      { text: '2 dashboards ativos', included: true },
      { text: '3 dashboards no total', included: true },
      { text: 'Upload de dados', included: true },
      { text: 'Análise com IA', included: true },
      { text: 'Exportação de dados', included: false },
      { text: 'Templates premium', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: '/mês',
    description: 'Para profissionais',
    features: [
      { text: '4 dashboards ativos', included: true },
      { text: '8 dashboards no total', included: true },
      { text: 'Upload de dados', included: true },
      { text: 'Análise com IA', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Templates premium', included: false },
      { text: 'Suporte prioritário', included: true },
    ],
    highlighted: true,
  },
  {
    name: 'Plus',
    price: 'R$ 59',
    period: '/mês',
    description: 'Para empresas',
    features: [
      { text: '8 dashboards ativos', included: true },
      { text: '12 dashboards no total', included: true },
      { text: 'Upload de dados', included: true },
      { text: 'Análise com IA', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Templates premium', included: true },
      { text: 'Suporte dedicado', included: true },
    ],
    highlighted: false,
  },
]

export function Pricing() {
  const { user } = useAuth()

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') {
      toast.success('Você já está no plano gratuito!')
    } else {
      toast.info('Integração com pagamento em breve!')
    }
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Escolha o plano ideal para você
        </h1>
        <p className="text-xl text-gray-400">
          Comece gratuitamente e faça upgrade quando precisar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="glass"
              className={`h-full flex flex-col ${
                plan.highlighted
                  ? 'ring-2 ring-primary-500 relative'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3"
                  >
                    {feature.included ? (
                      <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <FiX className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handleSelectPlan(plan.name)}
              >
                {plan.name === 'Free' && user
                  ? 'Plano Atual'
                  : 'Selecionar Plano'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Card variant="glass" className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-4">
            Perguntas Frequentes
          </h3>
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-medium text-white mb-2">
                Posso mudar de plano a qualquer momento?
              </h4>
              <p className="text-gray-400">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">
                Como funciona o período de teste?
              </h4>
              <p className="text-gray-400">
                O plano gratuito é permanente. Você pode usar para sempre com as limitações descritas.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">
                Quais formas de pagamento são aceitas?
              </h4>
              <p className="text-gray-400">
                Aceitamos cartões de crédito, débito e PIX através da Stripe.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}