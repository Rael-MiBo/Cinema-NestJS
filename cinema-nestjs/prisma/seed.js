"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const genero = await prisma.genero.upsert({
        where: { nome: 'Ação' },
        update: {},
        create: { nome: 'Ação' },
    });
    const filme = await prisma.filme.upsert({
        where: { id: 1 },
        update: {},
        create: {
            titulo: 'Filme Demo',
            sinopse: 'Sinopse de demonstração para o app mobile.',
            classificacao: '12',
            duracao: 120,
            dataIniciaExibicao: new Date('2025-01-01'),
            dataFinalExibicao: new Date('2030-12-31'),
            generoId: genero.id,
        },
    });
    const sala = await prisma.sala.upsert({
        where: { id: 1 },
        update: {},
        create: {
            numero: '1',
            capacidade: 48,
            poltronas: [
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
            ],
        },
    });
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(19, 0, 0, 0);
    await prisma.sessao.upsert({
        where: { id: 1 },
        update: {},
        create: {
            data: amanha,
            valorIngresso: 40,
            filmeId: filme.id,
            salaId: sala.id,
        },
    });
    await prisma.lancheCombo.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nome: 'Combo Pipoca + Refri',
            descricao: 'Pipoca grande e refrigerante 500ml',
            valorUnitario: 25,
            qtUnidade: 100,
            subtotal: 2500,
        },
    });
    const perfilCliente = await prisma.profile.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER' },
    });
    await prisma.profile.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN' },
    });
    await prisma.user.upsert({
        where: { email: 'demo@cinema.com' },
        update: {},
        create: {
            email: 'demo@cinema.com',
            name: 'Usuário Demo',
            password: '123456',
            profileId: perfilCliente.id,
        },
    });
    console.log('Seed concluído: demo@cinema.com / 123456');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map