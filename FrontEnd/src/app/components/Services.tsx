
export const listarPlanos = async (): Promise<{
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  beneficios: string[];
  funcionalidades: string[];
  duracao: string;  
  suporte: string; 
}[]> => {
  try {
    
    return [
      {
        id: 1,
        nome: 'Plano Básico',
        descricao: 'Plano inicial, para conhecer o MindCare.',
        preco: 'R$ 29,90',
        beneficios: ['Acesso a 4 consultas mensais', 'Chat durante horário comercial'],
        funcionalidades: ['Chat online com colaboradores', 'Agendamento de consultas'],
        duracao: 'Mensal',
        suporte: 'Durante horário comercial',
      },
      {
        id: 2,
        nome: 'Plano Intermediário',
        descricao: 'Plano com mais recursos e funcionalidades.',
        preco: 'R$ 59,90',
        beneficios: ['Acesso ilimitado a consultas', 'Suporte chat premium 24/7'],
        funcionalidades: ['Chat 24/7', 'Consultas ilimitadas'],
        duracao: 'Mensal',
        suporte: 'Suporte 24/7',
      },
      {
        id: 3,
        nome: 'Plano Avançado',
        descricao: 'Plano completo com todos os recursos.',
        preco: 'R$ 99,90',
        beneficios: ['Consultoria personalizada', 'Chat prioritário'],
        funcionalidades: ['Chat Prioritário', 'Consultas ilimitadas'],
        duracao: 'Anual',
        suporte: 'Suporte VIP 24/7',
      },
    ];
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    throw new Error('Não foi possível carregar os planos. Tente novamente mais tarde.');
  }
};

export const contratarPlano = async (id: number): Promise<void> => {
  try {
    console.log(`Plano com id ${id} contratado com sucesso!`);
  } catch (error) {
    console.error('Erro ao contratar plano:', error);
    throw new Error('Não foi possível contratar o plano. Tente novamente mais tarde.');
  }
};
