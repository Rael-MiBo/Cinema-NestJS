let pedidoAtualId = null;
let carrinhoLanches = [];
let sessoesCache = [];
let assentoSelecionado = null;
let filmeEditandoId = null;
let salaEditandoId = null;
let sessaoEditandoId = null;
let lancheEditandoId = null;
const API_URL = 'http://localhost:3000';

function toast(msg, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.innerHTML = `<i class="ph-fill ${tipo === 'success' ? 'ph-check-circle' : 'ph-x-circle'}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.25s ease forwards';
    setTimeout(() => el.remove(), 260);
  }, 3500);
}

function openTab(tabId, btn) {
  document
    .querySelectorAll('.tab-content')
    .forEach((el) => el.classList.remove('active'));
  document
    .querySelectorAll('.nav-btn')
    .forEach((el) => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btn) btn.classList.add('active');
  carregarDados();
}

async function fazerLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-senha').value;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Falha no login');
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    verificarAcesso();
  } catch {
    toast('Credenciais inválidas ou erro na conexão.', 'error');
  }
}

function verificarAcesso() {
  const token = localStorage.getItem('token');
  if (!token) {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-content').style.display = 'none';
    return;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-content').style.display = 'flex';
    configurarMenuPorCargo(payload.role);
    carregarDados();
  } catch {
    logout();
  }
}

function configurarMenuPorCargo(role) {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const oc = btn.getAttribute('onclick') || '';
    if (role === 'USER') {
      if (
        oc.includes('tab-catalogo') ||
        oc.includes('tab-infra') ||
        oc.includes('tab-gerenciar')
      ) {
        btn.style.display = 'none';
      }
    } else {
      btn.style.display = 'flex';
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  location.reload();
}

async function request(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_URL + endpoint, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro na requisição');
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function popularSelect(id, lista, valueKey, textFn, placeholder = null) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  if (placeholder) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    el.appendChild(opt);
  }
  (Array.isArray(lista) ? lista : []).forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = textFn(item);
    el.appendChild(opt);
  });
}

function adicionarLancheLista() {
  const select = document.getElementById('pedido-lanche-select');
  const qtdEl = document.getElementById('pedido-lanche-qtd');
  const lancheId = parseInt(select.value);
  const quantidade = parseInt(qtdEl.value) || 1;
  if (!lancheId) return;
  const nome = select.options[select.selectedIndex].text;
  const existe = carrinhoLanches.find((i) => i.id === lancheId);
  if (existe) {
    existe.quantidade += quantidade;
  } else {
    carrinhoLanches.push({ id: lancheId, nome, quantidade });
  }
  renderizarCarrinho();
  qtdEl.value = 1;
  select.value = '';
}

function removerLancheCarrinho(lancheId) {
  const idx = carrinhoLanches.findIndex((i) => i.id === lancheId);
  if (idx > -1) {
    if (carrinhoLanches[idx].quantidade > 1) carrinhoLanches[idx].quantidade--;
    else carrinhoLanches.splice(idx, 1);
  }
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const ul = document.getElementById('carrinho-lanches');
  if (!ul) return;
  ul.innerHTML = '';
  carrinhoLanches.forEach((item) => {
    const li = document.createElement('li');
    li.style.cssText =
      'background:var(--surface);padding:8px 12px;border-radius:6px;margin-bottom:6px;border:1px solid var(--border-s);';
    li.innerHTML = `<span><b>${item.quantidade}×</b> ${item.nome}</span>
      <button type="button" class="btn-icon btn-sm" onclick="removerLancheCarrinho(${item.id})">
        <i class="ph ph-minus"></i>
      </button>`;
    ul.appendChild(li);
  });
}

async function abrirSeletorPoltronas() {
  const sessaoId = parseInt(document.getElementById('ingresso-sessao').value);
  if (!sessaoId) return toast('Selecione uma sessão primeiro.', 'error');

  const sessao = sessoesCache.find((s) => s.id === sessaoId);
  if (!sessao) return toast('Sessão não encontrada.', 'error');

  let ingressosVendidos = [];
  try {
    const todos = await request('/ingressos');
    ingressosVendidos = todos.filter((i) => i.sessaoId === sessaoId);
  } catch (e) {
    console.error(e);
  }

  const poltronas = sessao.sala.poltronas;
  const numFilas = poltronas.length;
  const numAssentos = numFilas > 0 ? poltronas[0].length : 0;
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  document.getElementById('modal-sessao-titulo').textContent =
    `${sessao.filme.titulo} — ${new Date(sessao.data).toLocaleString()} | Sala ${sessao.sala.numero}`;

  const grade = document.getElementById('grade-poltronas');
  grade.innerHTML = '';

  const cabecalho = document.createElement('div');
  cabecalho.className = 'grade-row';
  const vazio = document.createElement('div');
  vazio.className = 'grade-row-header';
  cabecalho.appendChild(vazio);
  for (let a = 0; a < numAssentos; a++) {
    const th = document.createElement('div');
    th.className = 'grade-col-header';
    th.textContent = a + 1;
    cabecalho.appendChild(th);
  }
  grade.appendChild(cabecalho);

  for (let f = 0; f < numFilas; f++) {
    const row = document.createElement('div');
    row.className = 'grade-row';

    const rowLabel = document.createElement('div');
    rowLabel.className = 'grade-row-header';
    rowLabel.textContent = letras[f] || f;
    row.appendChild(rowLabel);

    for (let a = 0; a < numAssentos; a++) {
      const val = poltronas[f][a];
      const btn = document.createElement('button');
      btn.type = 'button';

      if (!val) {
        btn.className = 'poltrona vazio';
        btn.disabled = true;
      } else {
        const ocupado = ingressosVendidos.some(
          (i) => i.fila === f && i.assento === a,
        );
        if (ocupado) {
          btn.className = 'poltrona ocupado';
          btn.disabled = true;
          btn.title = `Fila ${letras[f] || f} | Assento ${a + 1} — Ocupado`;
        } else {
          btn.className = 'poltrona livre';
          btn.title = `Fila ${letras[f] || f} | Assento ${a + 1}`;
          btn.onclick = () => selecionarPoltrona(f, a, btn);
        }
      }
      row.appendChild(btn);
    }
    grade.appendChild(row);
  }

  document.getElementById('legenda-poltronas').innerHTML = `
    <span class="leg-item"><span class="leg-box livre"></span> Livre</span>
    <span class="leg-item"><span class="leg-box ocupado"></span> Ocupado</span>
    <span class="leg-item"><span class="leg-box selecionado"></span> Selecionado</span>
  `;

  assentoSelecionado = null;
  atualizarInfoSelecionado();
  document.getElementById('modal-poltronas').classList.add('aberto');
}

function selecionarPoltrona(fila, assento, btnEl) {
  document
    .querySelectorAll('.poltrona.selecionado')
    .forEach((b) => b.classList.replace('selecionado', 'livre'));
  btnEl.classList.replace('livre', 'selecionado');
  assentoSelecionado = { fila, assento };
  atualizarInfoSelecionado();
}

function atualizarInfoSelecionado() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const info = document.getElementById('info-assento-selecionado');
  const btn = document.getElementById('btn-confirmar-assento');
  if (assentoSelecionado) {
    const l = letras[assentoSelecionado.fila] || assentoSelecionado.fila;
    info.textContent = `Selecionado: Fila ${l} | Assento ${assentoSelecionado.assento + 1}`;
    info.style.color = 'var(--green)';
    btn.disabled = false;
  } else {
    info.textContent = 'Nenhum assento selecionado';
    info.style.color = 'var(--muted)';
    btn.disabled = true;
  }
}

function confirmarAssento() {
  if (!assentoSelecionado) return;
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l = letras[assentoSelecionado.fila] || assentoSelecionado.fila;
  document.getElementById('ingresso-fila').value = assentoSelecionado.fila;
  document.getElementById('ingresso-assento').value =
    assentoSelecionado.assento;
  document.getElementById('assento-display-text').textContent =
    `Fila ${l} | Assento ${assentoSelecionado.assento + 1}`;
  document.getElementById('assento-display').style.color = 'var(--green)';
  fecharModal();
}

function fecharModal() {
  document.getElementById('modal-poltronas').classList.remove('aberto');
}

document.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-poltronas')) fecharModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('ingresso-sessao');
  if (sel) {
    sel.addEventListener('change', () => {
      assentoSelecionado = null;
      document.getElementById('ingresso-fila').value = '';
      document.getElementById('ingresso-assento').value = '';
      document.getElementById('assento-display-text').textContent =
        'Nenhum assento selecionado';
      document.getElementById('assento-display').style.color = '';
    });
  }
});

async function carregarDados() {
  try {
    const [generos, filmes, salas, sessoes, ingressos, lanches, pedidos] =
      await Promise.all([
        request('/generos'),
        request('/filmes'),
        request('/salas'),
        request('/sessoes'),
        request('/ingressos'),
        request('/lanches-combos'),
        request('/pedidos'),
      ]);

    sessoesCache = sessoes;
    const pedidosValidos = Array.isArray(pedidos)
      ? pedidos.filter((p) => p.status !== 'REEMBOLSADO')
      : [];

    const dashFilmes = document.getElementById('dash-filmes');
    if (dashFilmes) {
      dashFilmes.textContent = filmes.length || 0;
      document.getElementById('dash-sessoes').textContent = sessoes.length || 0;
      document.getElementById('dash-pedidos').textContent =
        pedidosValidos.length || 0;
      const receita = pedidosValidos.reduce((acc, p) => acc + p.valorTotal, 0);
      document.getElementById('dash-receita').textContent =
        `R$ ${receita.toFixed(2).replace('.', ',')}`;

      const ul = document.getElementById('dash-pedidos-recentes');
      const recentes = Array.isArray(pedidos)
        ? [...pedidos].reverse().slice(0, 6)
        : [];
      ul.innerHTML =
        recentes
          .map(
            (p) => `
        <li>
          <span><b>Pedido #${p.id}</b></span>
          <span style="display:flex;align-items:center;gap:10px;">
            ${p.status === 'REEMBOLSADO' ? '<span class="badge badge-danger">Reembolsado</span>' : '<span class="badge badge-success">Concluído</span>'}
            <b style="color:${p.status === 'REEMBOLSADO' ? 'var(--red)' : 'var(--green)'};">R$ ${p.valorTotal.toFixed(2).replace('.', ',')}</b>
          </span>
        </li>
      `,
          )
          .join('') ||
        '<li style="color:var(--muted);justify-content:center;">Nenhum pedido ainda.</li>';
    }

    popularSelect('filme-genero', generos, 'id', (g) => g.nome);
    popularSelect(
      'sessao-filme',
      filmes,
      'id',
      (f) => f.titulo,
      '— Selecione um filme —',
    );
    popularSelect(
      'sessao-sala',
      salas,
      'id',
      (s) => `Sala ${s.numero}`,
      '— Selecione uma sala —',
    );

    const filmesGrid = document.getElementById('filmes-grid');
    if (filmesGrid) {
      filmesGrid.innerHTML =
        filmes
          .map(
            (f) => `
        <div class="card">
          <div>
            <div class="card-title">${f.titulo}</div>
            <div class="card-info"><i class="ph ph-clock"></i> ${f.duracao} min</div>
            <div class="card-info"><i class="ph ph-warning"></i> ${f.classificacao}</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn-sm" onclick="editarFilme(${f.id})" style="flex:1;background:var(--blue-dim);color:var(--blue);border:1px solid rgba(27,92,242,0.15);">
              <i class="ph ph-pencil"></i> Editar
            </button>
            <button class="btn-sm" style="flex:1;background:var(--red-dim);color:var(--red);border:1px solid rgba(229,9,20,0.2);" onclick="removerFilme(${f.id})">
              <i class="ph ph-trash"></i> Remover
            </button>
          </div>
        </div>
      `,
          )
          .join('') ||
        '<p style="color:var(--muted);padding:10px;">Nenhum filme cadastrado.</p>';
    }

    const salasList = document.getElementById('salas-list');
    if (salasList) {
      salasList.innerHTML =
        salas
          .map(
            (s) => `
        <li>
          <span><i class="ph ph-door" style="color:var(--red);margin-right:6px;"></i> Sala ${s.numero} — ${s.capacidade} lugares</span>
          <div style="display:flex;gap:6px;">
            <button class="btn-icon" onclick="editarSala(${s.id})"><i class="ph ph-pencil"></i></button>
            <button class="btn-icon" onclick="removerSala(${s.id})"><i class="ph ph-trash"></i></button>
          </div>
        </li>
      `,
          )
          .join('') ||
        '<li style="color:var(--muted);justify-content:center;">Nenhuma sala.</li>';
    }

    const sessoesList = document.getElementById('sessoes-list');
    if (sessoesList) {
      sessoesList.innerHTML =
        sessoes
          .map(
            (s) => `
        <li>
          <span><i class="ph ph-film-strip" style="color:var(--red);margin-right:6px;"></i>${s.filme.titulo} — Sala ${s.sala.numero} — ${new Date(s.data).toLocaleString()}</span>
          <div style="display:flex;gap:6px;">
            <button class="btn-icon" onclick="editarSessao(${s.id})"><i class="ph ph-pencil"></i></button>
            <button class="btn-icon" onclick="removerSessao(${s.id})"><i class="ph ph-trash"></i></button>
          </div>
        </li>
      `,
          )
          .join('') ||
        '<li style="color:var(--muted);justify-content:center;">Nenhuma sessão.</li>';
    }

    const lanchesList = document.getElementById('lanches-list');
    if (lanchesList) {
      lanchesList.innerHTML =
        lanches
          .map(
            (l) => `
        <li>
          <span><i class="ph ph-popcorn" style="color:var(--red);margin-right:6px;"></i>${l.nome} — R$ ${l.valorUnitario.toFixed(2)} — Estoque: ${l.qtUnidade}</span>
          <div style="display:flex;gap:6px;">
            <button class="btn-icon" onclick="editarLanche(${l.id})"><i class="ph ph-pencil"></i></button>
            <button class="btn-icon" onclick="removerLanche(${l.id})"><i class="ph ph-trash"></i></button>
          </div>
        </li>
      `,
          )
          .join('') ||
        '<li style="color:var(--muted);justify-content:center;">Nenhum lanche.</li>';
    }

    popularSelect(
      'ingresso-sessao',
      sessoes,
      'id',
      (s) => `${s.filme.titulo} — ${new Date(s.data).toLocaleString()}`,
      '— Selecione a sessão —',
    );
    popularSelect(
      'pedido-ingressos',
      Array.isArray(ingressos) ? ingressos.filter((i) => !i.pedidoId) : [],
      'id',
      (i) => `Ingresso #${i.id} (${i.tipo})`,
    );

    const lancheSelect = document.getElementById('pedido-lanche-select');
    if (lancheSelect) {
      lancheSelect.innerHTML = '<option value="">— Nenhum —</option>';
      lanches
        .filter((l) => l.qtUnidade > 0)
        .forEach((l) => {
          const opt = document.createElement('option');
          opt.value = l.id;
          opt.textContent = `${l.nome} (R$ ${l.valorUnitario.toFixed(2)})`;
          lancheSelect.appendChild(opt);
        });
    }

    popularSelect(
      'gerenciar-pedido-select',
      pedidos,
      'id',
      (p) =>
        `Pedido #${p.id} — R$ ${p.valorTotal.toFixed(2)} ${p.status === 'REEMBOLSADO' ? '(Reembolsado)' : ''}`,
      '— Selecione um pedido —',
    );

    if (pedidoAtualId) carregarDetalhesPedido(pedidoAtualId);
  } catch (e) {
    console.error(e);
  }
}

async function carregarDetalhesPedido(idForcado = null) {
  const select = document.getElementById('gerenciar-pedido-select');
  const id = idForcado || select.value;
  const container = document.getElementById('detalhes-pedido-container');
  const acoes = document.getElementById('acoes-pedido');

  if (!id) {
    container.innerHTML = `<p style="color:var(--muted);text-align:center;padding:40px 20px;"><i class="ph ph-receipt" style="font-size:2rem;display:block;margin-bottom:10px;"></i>Selecione um pedido ao lado</p>`;
    acoes.style.display = 'none';
    pedidoAtualId = null;
    return;
  }

  pedidoAtualId = parseInt(id);
  acoes.style.display = 'block';

  try {
    const pedido = await request(`/pedidos/${id}`);
    const allIngressos = await request('/ingressos');
    const allLanches = await request('/lanches-combos');
    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));

    const isReembolsado = pedido.status === 'REEMBOLSADO';
    const cor = isReembolsado ? 'var(--red)' : 'var(--green)';

    let html = `
      <div class="pedido-header">
        <div>
          <div class="pedido-id">Pedido #${pedido.id}</div>
          <span class="badge ${isReembolsado ? 'badge-danger' : 'badge-success'}">${isReembolsado ? 'Reembolsado' : 'Concluído'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="pedido-valor" style="color:${cor};">R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}</span>
          ${!isReembolsado && payload.role === 'ADMIN' ? `<button onclick="reembolsarPedido(${pedido.id})" style="background:var(--red-dim);color:var(--red);border:1px solid rgba(229,9,20,0.2);width:auto;padding:8px 16px;"><i class="ph ph-arrow-counter-clockwise"></i> Reembolsar</button>` : ''}
        </div>
      </div>
      <p style="font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin:14px 0 8px;font-weight:600;">Ingressos</p>
      <ul>`;

    pedido.ingressos.forEach((ing) => {
      html += `<li><span>${ing.tipo} — R$ ${ing.valorPago}</span><button class="btn-icon" onclick="removerItemPedido('ingressos', ${ing.id})"><i class="ph ph-trash"></i></button></li>`;
    });

    html += `</ul><p style="font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin:14px 0 8px;font-weight:600;">Lanches</p><ul>`;

    (pedido.lanches || []).forEach((item) => {
      html += `<li><span>${item.quantidade}× ${item.lanche.nome}</span><div style="display:flex;gap:6px;">
        <button class="btn-icon" onclick="adicionarItemPedido('lanches', ${item.lanche.id})"><i class="ph ph-plus"></i></button>
        <button class="btn-icon" onclick="removerItemPedido('lanches', ${item.lanche.id})"><i class="ph ph-minus"></i></button>
      </div></li>`;
    });

    container.innerHTML = html + '</ul>';

    popularSelect(
      'add-ingresso-select',
      allIngressos.filter((i) => !i.pedidoId),
      'id',
      (i) => `Ingresso #${i.id} (${i.tipo})`,
      '— Selecione —',
    );
    popularSelect(
      'add-lanche-select',
      allLanches.filter((l) => l.qtUnidade > 0),
      'id',
      (l) => l.nome,
      '— Selecione —',
    );
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function reembolsarPedido(id) {
  if (!confirm(`Confirma o reembolso do Pedido #${id}?`)) return;
  try {
    await request(`/pedidos/${id}/reembolsar`, 'PATCH');
    toast('Pedido reembolsado com sucesso.');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function adicionarItemPedido(tipo, itemIdManual = null) {
  const elId =
    tipo === 'ingressos' ? 'add-ingresso-select' : 'add-lanche-select';
  const itemId = itemIdManual || document.getElementById(elId)?.value;
  if (!itemId) return toast('Selecione um item.', 'error');
  try {
    await request(`/pedidos/${pedidoAtualId}/${tipo}/${itemId}`, 'POST');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function removerItemPedido(tipo, itemId) {
  try {
    await request(`/pedidos/${pedidoAtualId}/${tipo}/${itemId}`, 'DELETE');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function editarFilme(id) {
  try {
    const filme = await request(`/filmes/${id}`);
    filmeEditandoId = id;
    document.getElementById('filme-titulo').value = filme.titulo || '';
    document.getElementById('filme-sinopse').value = filme.sinopse || '';
    document.getElementById('filme-elenco').value = filme.elenco || '';
    document.getElementById('filme-duracao').value = filme.duracao || '';
    document.getElementById('filme-class').value = filme.classificacao || 'L';
    document.getElementById('filme-inicio').value = filme.dataIniciaExibicao
      ? new Date(filme.dataIniciaExibicao).toISOString().slice(0, 10)
      : '';
    document.getElementById('filme-fim').value = filme.dataFinalExibicao
      ? new Date(filme.dataFinalExibicao).toISOString().slice(0, 10)
      : '';
    document.getElementById('filme-genero').value = filme.generoId || '';
    document.getElementById('filme-submit-btn').innerHTML =
      '<i class="ph ph-check-circle"></i> Atualizar Filme';
    document.getElementById('filme-cancel-btn').style.display = 'inline-flex';
    openTab('tab-catalogo');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function resetFilmeForm() {
  filmeEditandoId = null;
  const form = document.getElementById('form-filme');
  if (form) form.reset();
  document.getElementById('filme-submit-btn').innerHTML =
    '<i class="ph ph-plus-circle"></i> Cadastrar Filme';
  document.getElementById('filme-cancel-btn').style.display = 'none';
}

async function editarSala(id) {
  try {
    const sala = await request(`/salas/${id}`);
    salaEditandoId = id;
    document.getElementById('sala-numero').value = sala.numero || '';
    const filas = sala.poltronas?.length || 0;
    const assentos = filas ? sala.poltronas[0].length : 0;
    document.getElementById('sala-filas').value = filas || '';
    document.getElementById('sala-assentos').value = assentos || '';
    document.getElementById('sala-submit-btn').innerHTML =
      '<i class="ph ph-check-circle"></i> Atualizar Sala';
    document.getElementById('sala-cancel-btn').style.display = 'inline-flex';
    openTab('tab-infra');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function resetSalaForm() {
  salaEditandoId = null;
  const form = document.getElementById('form-sala');
  if (form) form.reset();
  document.getElementById('sala-submit-btn').innerHTML =
    '<i class="ph ph-check-circle"></i> Salvar Sala';
  document.getElementById('sala-cancel-btn').style.display = 'none';
}

async function editarSessao(id) {
  try {
    const sessao = await request(`/sessoes/${id}`);
    sessaoEditandoId = id;
    document.getElementById('sessao-filme').value = sessao.filmeId || '';
    document.getElementById('sessao-sala').value = sessao.salaId || '';
    document.getElementById('sessao-data').value = sessao.data
      ? new Date(sessao.data).toISOString().slice(0, 16)
      : '';
    document.getElementById('sessao-valor').value =
      sessao.valorIngresso != null ? sessao.valorIngresso : '';
    document.getElementById('sessao-submit-btn').innerHTML =
      '<i class="ph ph-check-circle"></i> Atualizar Sessão';
    document.getElementById('sessao-cancel-btn').style.display = 'inline-flex';
    openTab('tab-infra');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function resetSessaoForm() {
  sessaoEditandoId = null;
  const form = document.getElementById('form-sessao');
  if (form) form.reset();
  document.getElementById('sessao-submit-btn').innerHTML =
    '<i class="ph ph-calendar-plus"></i> Agendar Sessão';
  document.getElementById('sessao-cancel-btn').style.display = 'none';
}

async function editarLanche(id) {
  try {
    const lanche = await request(`/lanches-combos/${id}`);
    lancheEditandoId = id;
    document.getElementById('lanche-nome').value = lanche.nome || '';
    document.getElementById('lanche-desc').value = lanche.descricao || '';
    document.getElementById('lanche-valor').value =
      lanche.valorUnitario != null ? lanche.valorUnitario : '';
    document.getElementById('lanche-qtd').value =
      lanche.qtUnidade != null ? lanche.qtUnidade : '';
    document.getElementById('lanche-submit-btn').innerHTML =
      '<i class="ph ph-check-circle"></i> Atualizar Lanche';
    document.getElementById('lanche-cancel-btn').style.display = 'inline-flex';
    openTab('tab-infra');
  } catch (err) {
    toast(err.message, 'error');
  }
}

function resetLancheForm() {
  lancheEditandoId = null;
  const form = document.getElementById('form-lanche');
  if (form) form.reset();
  document.getElementById('lanche-submit-btn').innerHTML =
    '<i class="ph ph-plus-circle"></i> Salvar Lanche';
  document.getElementById('lanche-cancel-btn').style.display = 'none';
}

async function removerFilme(id) {
  if (!confirm('Remover este filme?')) return;
  try {
    await request(`/filmes/${id}`, 'DELETE');
    toast('Filme removido.');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function removerSala(id) {
  if (!confirm('Remover esta sala?')) return;
  try {
    await request(`/salas/${id}`, 'DELETE');
    toast('Sala removida.');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function removerSessao(id) {
  if (!confirm('Remover esta sessão?')) return;
  try {
    await request(`/sessoes/${id}`, 'DELETE');
    toast('Sessão removida.');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function removerLanche(id) {
  if (!confirm('Remover este lanche?')) return;
  try {
    await request(`/lanches-combos/${id}`, 'DELETE');
    toast('Lanche removido.');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
}

document.getElementById('form-genero').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await request('/generos', 'POST', {
      nome: document.getElementById('genero-nome').value,
    });
    e.target.reset();
    toast('Gênero salvo!');
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.getElementById('form-filme').onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    titulo: document.getElementById('filme-titulo').value,
    sinopse: document.getElementById('filme-sinopse').value,
    elenco: document.getElementById('filme-elenco').value,
    duracao: parseInt(document.getElementById('filme-duracao').value),
    classificacao: document.getElementById('filme-class').value,
    dataIniciaExibicao: new Date(
      document.getElementById('filme-inicio').value,
    ).toISOString(),
    dataFinalExibicao: new Date(
      document.getElementById('filme-fim').value,
    ).toISOString(),
    generoId: parseInt(document.getElementById('filme-genero').value),
  };

  try {
    if (filmeEditandoId) {
      await request(`/filmes/${filmeEditandoId}`, 'PATCH', payload);
      toast('Filme atualizado!');
      resetFilmeForm();
    } else {
      await request('/filmes', 'POST', payload);
      toast('Filme cadastrado!');
    }
    e.target.reset();
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.getElementById('form-sala').onsubmit = async (e) => {
  e.preventDefault();
  const filas = parseInt(document.getElementById('sala-filas').value);
  const assentos = parseInt(document.getElementById('sala-assentos').value);
  const poltronas = Array.from({ length: filas }, () =>
    Array(assentos).fill(1),
  );
  const payload = {
    numero: document.getElementById('sala-numero').value,
    poltronas,
  };
  try {
    if (salaEditandoId) {
      await request(`/salas/${salaEditandoId}`, 'PATCH', payload);
      toast('Sala atualizada!');
      resetSalaForm();
    } else {
      await request('/salas', 'POST', payload);
      toast('Sala salva!');
    }
    e.target.reset();
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.getElementById('form-sessao').onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    filmeId: parseInt(document.getElementById('sessao-filme').value),
    salaId: parseInt(document.getElementById('sessao-sala').value),
    data: new Date(document.getElementById('sessao-data').value).toISOString(),
    valorIngresso: parseFloat(document.getElementById('sessao-valor').value),
  };
  try {
    if (sessaoEditandoId) {
      await request(`/sessoes/${sessaoEditandoId}`, 'PATCH', payload);
      toast('Sessão atualizada!');
      resetSessaoForm();
    } else {
      await request('/sessoes', 'POST', payload);
      toast('Sessão agendada!');
    }
    e.target.reset();
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.getElementById('form-lanche').onsubmit = async (e) => {
  e.preventDefault();
  const nome = document.getElementById('lanche-nome').value;
  const descricao = document.getElementById('lanche-desc').value;
  const valorUnitario = parseFloat(
    document.getElementById('lanche-valor').value,
  );
  const qtUnidade = parseInt(document.getElementById('lanche-qtd').value);
  const payload = {
    nome,
    descricao,
    valorUnitario,
    qtUnidade,
  };
  try {
    if (lancheEditandoId) {
      await request(`/lanches-combos/${lancheEditandoId}`, 'PATCH', payload);
      toast('Lanche/Combo atualizado!');
      resetLancheForm();
    } else {
      await request('/lanches-combos', 'POST', payload);
      toast('Lanche/Combo salvo!');
    }
    e.target.reset();
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.getElementById('form-ingresso').onsubmit = async (e) => {
  e.preventDefault();
  const fila = parseInt(document.getElementById('ingresso-fila').value);
  const assento = parseInt(document.getElementById('ingresso-assento').value);
  if (isNaN(fila) || isNaN(assento)) {
    return toast('Selecione um assento no mapa da sala.', 'error');
  }
  try {
    await request('/ingressos', 'POST', {
      sessaoId: parseInt(document.getElementById('ingresso-sessao').value),
      tipo: document.getElementById('ingresso-tipo').value,
      fila,
      assento,
    });
    toast('Ingresso gerado!');
    assentoSelecionado = null;
    document.getElementById('ingresso-fila').value = '';
    document.getElementById('ingresso-assento').value = '';
    document.getElementById('assento-display-text').textContent =
      'Nenhum assento selecionado';
    document.getElementById('assento-display').style.color = '';
    e.target.reset();
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

document.getElementById('form-pedido').onsubmit = async (e) => {
  e.preventDefault();
  const ingressos = Array.from(
    document.getElementById('pedido-ingressos').selectedOptions,
  ).map((o) => parseInt(o.value));
  const lancheIds = [];
  carrinhoLanches.forEach((item) => {
    for (let i = 0; i < item.quantidade; i++) lancheIds.push(item.id);
  });
  if (ingressos.length === 0 && lancheIds.length === 0) {
    return toast('Adicione pelo menos um ingresso ou lanche.', 'error');
  }
  try {
    await request('/pedidos', 'POST', {
      ingressoIds: ingressos,
      lancheComboIds: lancheIds,
    });
    toast('Pedido finalizado!');
    carrinhoLanches = [];
    renderizarCarrinho();
    e.target.reset();
    carregarDados();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.addEventListener('load', verificarAcesso);
