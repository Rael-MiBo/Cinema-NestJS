export type User = {
    id: number;
    email: string;
    name: string;
    role: string;
};
export type AuthResponse = {
    access_token: string;
    user: User;
};
export type Filme = {
    id: number;
    titulo: string;
    sinopse?: string;
    classificacao: string;
    duracao: number;
    genero?: {
        nome: string;
    };
};
export type Sessao = {
    id: number;
    data: string;
    valorIngresso: number;
    filme?: Filme;
    sala?: {
        numero: string;
        poltronas: number[][];
    };
    ingressos?: {
        fila: number;
        assento: number;
    }[];
};
export type LancheCombo = {
    id: number;
    nome: string;
    descricao?: string;
    valorUnitario: number;
    qtUnidade: number;
};
export type Pedido = {
    id: number;
    dataHora: string;
    valorTotal: number;
    status: string;
    metodoPagamento?: string;
    qtInteira: number;
    qtMeia: number;
    ingressos: {
        id: number;
        tipo: string;
        valorPago: number;
        fila: number;
        assento: number;
        sessao?: Sessao & {
            filme?: Filme;
            sala?: {
                numero: string;
            };
        };
    }[];
    lanches: {
        quantidade: number;
        lanche: LancheCombo;
    }[];
};
export type SeatSelection = {
    fila: number;
    assento: number;
    tipo: 'inteira' | 'meia';
};
