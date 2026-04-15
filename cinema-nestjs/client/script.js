let pedidoAtualId = null;
let carrinhoLanches = [];
const API_URL = 'http://localhost:3000';

let assentoSelecionado = null;
let sessoesCache = [];

function openTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((el) => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btn) btn.classList.add('active');
  carregarDados();
}

async function request(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(API_URL + endpoint, options);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro na requisição');
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function fazerLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-senha").value;
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Falha no login");
    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    verificarAcesso();
  } catch (error) {
    alert("Credenciais inválidas ou erro na conexão.");
  }
}

function verificarAcesso() {
  const token = localStorage.getItem('token');
  if (!token) {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("app-content").style.display = "none";
    return;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-content").style.display = "flex";
    configurarMenuPorCargo(payload.role);
    carregarDados();
  } catch (e) {
    logout();
  }
}

function configurarMenuPorCargo(role) {
  const btsAdmin = document.querySelectorAll(".nav-btn");
  btsAdmin.forEach((btn) => {
    const clickAttr = btn.getAttribute("onclick");
    if (role === "USER") {
      if (
        clickAttr.includes("tab-catalogo") ||
        clickAttr.includes("tab-infra") ||
        clickAttr.includes("tab-gerenciar")
      ) {
        btn.style.display = "none";
      }
    } else {
      btn.style.display = "flex";
    }
  });
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function popularSelect(id, lista, valueKey, textKey, defaultOption = null) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = '';
  if (defaultOption) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = defaultOption;
    select.appendChild(opt);
  }
  if (Array.isArray(lista)) {
    lista.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item[valueKey];
      opt.textContent = textKey(item);
      select.appendChild(opt);
    });
  }
}

function adicionarLancheLista() {
  const select = document.getElementById('pedido-lanche-select');
  const qtdInput = document.getElementById('pedido-lanche-qtd');
  const lancheId = parseInt(select.value);
  const quantidade = parseInt(qtdInput.value);
  if (!lancheId) return alert('Selecione um lanche.');
  const lancheNome = select.options[select.selectedIndex].text;
  const itemExistente = carrinhoLanches.find((item) => item.id === lancheId);
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinhoLanches.push({ id: lancheId, nome: lancheNome, quantidade: quantidade });
  }
  renderizarCarrinhoPDV();
  qtdInput.value = 1;
}

function removerLancheCarrinho(lancheId) {
  const index = carrinhoLanches.findIndex((item) => item.id === lancheId);
  if (index > -1) {
    if (carrinhoLanches[index].quantidade > 1) {
      carrinhoLanches[index].quantidade--;
    } else {
      carrinhoLanches.splice(index, 1);
    }
  }
  renderizarCarrinhoPDV();
}

function renderizarCarrinhoPDV() {
  const listaUI = document.getElementById('carrinho-lanches');
  if (!listaUI) return;
  listaUI.innerHTML = '';
  carrinhoLanches.forEach((item) => {
    const li = document.createElement('li');
    li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:8px;';
    li.innerHTML = `<span><b>${item.quantidade}x</b> ${item.nome}</span>
      <button type="button" class="btn-small" onclick="removerLancheCarrinho(${item.id})" style="background-color:var(--danger);padding:2px 8px;"><i class="ph ph-minus"></i></button>`;
    listaUI.appendChild(li);
  });
}

async function abrirSeletorPoltronas() {
  const sessaoId = parseInt(document.getElementById('ingresso-sessao').value);
  if (!sessaoId) return alert('Selecione uma sessão primeiro.');

  const sessao = sessoesCache.find(s => s.id === sessaoId);
  if (!sessao) return alert('Sessão não encontrada.');

  let ingressosVendidos = [];
  try {
    const todos = await request('/ingressos');
    ingressosVendidos = todos.filter(i => i.sessaoId === sessaoId);
  } catch (e) {
    console.error(e);
  }

  const poltronas = sessao.sala.poltronas;
  const numFilas = poltronas.length;
  const numAssentos = numFilas > 0 ? poltronas[0].length : 0;

  const modal = document.getElementById('modal-poltronas');
  const titulo = document.getElementById('modal-sessao-titulo');
  const grade = document.getElementById('grade-poltronas');

  titulo.textContent = `${sessao.filme.titulo} — ${new Date(sessao.data).toLocaleString()} | Sala ${sessao.sala.numero}`;
  grade.innerHTML = '';

  const legenda = document.getElementById('legenda-poltronas');
  legenda.innerHTML = `
    <span class="leg-item"><span class="leg-box livre"></span> Livre</span>
    <span class="leg-item"><span class="leg-box ocupado"></span> Ocupado</span>
    <span class="leg-item"><span class="leg-box selecionado"></span> Selecionado</span>
  `;

  const cabecalho = document.createElement('div');
  cabecalho.className = 'grade-row';
  cabecalho.appendChild(document.createElement('div'));
  for (let a = 0; a < numAssentos; a++) {
    const th = document.createElement('div');
    th.className = 'grade-col-header';
    th.textContent = a + 1;
    cabecalho.appendChild(th);
  }
  grade.appendChild(cabecalho);

  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let f = 0; f < numFilas; f++) {
    const row = document.createElement('div');
    row.className = 'grade-row';

    const rowLabel = document.createElement('div');
    rowLabel.className = 'grade-row-header';
    rowLabel.textContent = letras[f] || f;
    row.appendChild(rowLabel);

    for (let a = 0; a < numAssentos; a++) {
      const poltrona = poltronas[f][a];
      const btn = document.createElement('button');
      btn.type = 'button';

      if (poltrona === 0) {
        btn.className = 'poltrona vazio';
        btn.disabled = true;
      } else {
        const ocupado = ingressosVendidos.some(i => i.fila === f && i.assento === a);
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

  assentoSelecionado = null;
  atualizarInfoSelecionado();

  modal.classList.add('aberto');
}

function selecionarPoltrona(fila, assento, btnEl) {
  document.querySelectorAll('.poltrona.selecionado').forEach(b => b.classList.replace('selecionado', 'livre'));
  btnEl.classList.replace('livre', 'selecionado');
  assentoSelecionado = { fila, assento };
  atualizarInfoSelecionado();
}

function atualizarInfoSelecionado() {
  const info = document.getElementById('info-assento-selecionado');
  const btnConfirmar = document.getElementById('btn-confirmar-assento');
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (assentoSelecionado) {
    const letraFila = letras[assentoSelecionado.fila] || assentoSelecionado.fila;
    info.textContent = `Selecionado: Fila ${letraFila} | Assento ${assentoSelecionado.assento + 1}`;
    info.style.color = 'var(--success)';
    btnConfirmar.disabled = false;
  } else {
    info.textContent = 'Nenhum assento selecionado';
    info.style.color = 'var(--text-muted)';
    btnConfirmar.disabled = true;
  }
}

function confirmarAssento() {
  if (!assentoSelecionado) return;
  document.getElementById('ingresso-fila').value = assentoSelecionado.fila;
  document.getElementById('ingresso-assento').value = assentoSelecionado.assento;

  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letraFila = letras[assentoSelecionado.fila] || assentoSelecionado.fila;
  const display = document.getElementById('assento-display');
  display.textContent = `Fila ${letraFila} | Assento ${assentoSelecionado.assento + 1}`;
  display.style.color = 'var(--success)';

  fecharModal();
}

function fecharModal() {
  document.getElementById('modal-poltronas').classList.remove('aberto');
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-poltronas');
  if (modal && e.target === modal) fecharModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const selectSessao = document.getElementById('ingresso-sessao');
  if (selectSessao) {
    selectSessao.addEventListener('change', () => {
      assentoSelecionado = null;
      document.getElementById('ingresso-fila').value = '';
      document.getElementById('ingresso-assento').value = '';
      const display = document.getElementById('assento-display');
      if (display) { display.textContent = 'Nenhum assento selecionado'; display.style.color = 'var(--text-muted)'; }
    });
  }
});

async function carregarDados() {
  try {
    const generos = await request('/generos');
    const filmes = await request('/filmes');
    const salas = await request('/salas');
    const sessoes = await request('/sessoes');
    const ingressos = await request('/ingressos');
    const lanches = await request('/lanches-combos');
    const pedidos = await request('/pedidos');

    sessoesCache = sessoes;

    const pedidosValidos = Array.isArray(pedidos) ? pedidos.filter(p => p.status !== 'REEMBOLSADO') : [];

    if (document.getElementById('dash-filmes')) {
      document.getElementById('dash-filmes').textContent = filmes.length || 0;
      document.getElementById('dash-sessoes').textContent = sessoes.length || 0;
      document.getElementById('dash-pedidos').textContent = pedidosValidos.length || 0;
      const receita = pedidosValidos.reduce((acc, p) => acc + p.valorTotal, 0);
      document.getElementById('dash-receita').textContent = `R$ ${receita.toFixed(2)}`;

      const pedidosRecentes = Array.isArray(pedidos) ? [...pedidos].reverse().slice(0, 5) : [];
      document.getElementById('dash-pedidos-recentes').innerHTML = pedidosRecentes.map(p => `
        <li><span><b>Pedido #${p.id}</b> ${p.status === 'REEMBOLSADO' ? '[REEMBOLSADO]' : ''}</span><span style="color:${p.status === 'REEMBOLSADO' ? 'var(--danger)' : 'var(--success)'};font-weight:bold;">R$ ${p.valorTotal.toFixed(2)}</span></li>
      `).join('') || '<p style="color:var(--text-muted);padding:10px;">Nenhum pedido recente.</p>';
    }

    popularSelect('filme-genero', generos, 'id', (g) => g.nome);
    popularSelect('sessao-filme', filmes, 'id', (f) => f.titulo);
    popularSelect('sessao-sala', salas, 'id', (s) => `Sala ${s.numero}`);

    const filmesGrid = document.getElementById('filmes-grid');
    if (filmesGrid) {
      filmesGrid.innerHTML = filmes.map(f => `
        <div class="card">
          <div><div class="card-title">${f.titulo}</div><div class="card-info">${f.duracao} min | ${f.classificacao}</div></div>
          <button class="btn-small" style="background-color:var(--danger);margin-top:15px;width:100%;color:white;" onclick="removerFilme(${f.id})"><i class="ph ph-trash"></i> Remover</button>
        </div>
      `).join('');
    }

    const salasList = document.getElementById('salas-list');
    if (salasList) {
      salasList.innerHTML = salas.map(s => `<li><span>Sala ${s.numero}</span> <button class="btn-small" onclick="removerSala(${s.id})"><i class="ph ph-trash"></i></button></li>`).join('');
    }

    const sessoesList = document.getElementById('sessoes-list');
    if (sessoesList) {
      sessoesList.innerHTML = sessoes.map(s => `<li><span>${s.filme.titulo} - ${s.sala.numero}</span> <button class="btn-small" onclick="removerSessao(${s.id})"><i class="ph ph-trash"></i></button></li>`).join('');
    }

    popularSelect('ingresso-sessao', sessoes, 'id', (s) => `${s.filme.titulo} - ${new Date(s.data).toLocaleString()}`);
    popularSelect('pedido-ingressos', Array.isArray(ingressos) ? ingressos.filter((i) => !i.pedidoId) : [], 'id', (i) => `Ingresso #${i.id} (${i.tipo})`);
    popularSelect('pedido-lanche-select', Array.isArray(lanches) ? lanches.filter((l) => l.qtUnidade > 0) : [], 'id', (l) => `${l.nome}`, 'Selecione...');
    popularSelect('gerenciar-pedido-select', pedidos, 'id', (p) => `Pedido #${p.id} - R$ ${p.valorTotal.toFixed(2)} ${p.status === 'REEMBOLSADO' ? '(R)' : ''}`, 'Selecione um pedido...');

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
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">Selecione um pedido.</p>';
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
    const payload = JSON.parse(atob(token.split(".")[1]));

    let html = `
      <div style="padding:20px;border:1px solid var(--border-color);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3>Pedido #${pedido.id} [${pedido.status || 'CONCLUIDO'}]</h3>
          <p style="font-size:1.5rem;color:${pedido.status === 'REEMBOLSADO' ? 'var(--danger)' : 'var(--success)'};">R$ ${pedido.valorTotal.toFixed(2)}</p>
        </div>
        ${pedido.status !== 'REEMBOLSADO' && payload.role === 'ADMIN' ?
          `<button onclick="reembolsarPedido(${pedido.id})" style="background-color:var(--danger);width:auto;padding:10px 20px;"><i class="ph ph-arrow-counter-clockwise"></i> Reembolsar</button>` : ''
        }
      </div>`;

    html += `<p>Ingressos</p><ul>`;
    pedido.ingressos.forEach((ing) => {
      html += `<li><span>${ing.tipo} - R$ ${ing.valorPago}</span> <button class="btn-small" onclick="removerItemPedido('ingressos', ${ing.id})">Remover</button></li>`;
    });
    html += `</ul><p>Lanches</p><ul>`;
    if (pedido.lanches) {
      pedido.lanches.forEach((item) => {
        html += `<li><span>${item.quantidade}x ${item.lanche.nome}</span> <div><button class="btn-small" onclick="adicionarItemPedido('lanches', ${item.lanche.id})">+</button><button class="btn-small" onclick="removerItemPedido('lanches', ${item.lanche.id})">-</button></div></li>`;
      });
    }
    container.innerHTML = html + '</ul>';
    popularSelect('add-ingresso-select', allIngressos.filter((i) => !i.pedidoId), 'id', (i) => `Ingresso #${i.id}`, 'Selecione...');
    popularSelect('add-lanche-select', allLanches.filter((l) => l.qtUnidade > 0), 'id', (l) => `${l.nome}`, 'Selecione...');
  } catch (err) {
    alert(err.message);
  }
}

async function reembolsarPedido(id) {
  if (!confirm(`Deseja reembolsar o Pedido #${id}?`)) return;
  try {
    await request(`/pedidos/${id}/reembolsar`, 'PATCH');
    alert('Pedido reembolsado!');
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
}

async function adicionarItemPedido(tipo, itemIdManual = null) {
  const itemId = itemIdManual || document.getElementById(tipo === 'ingressos' ? 'add-ingresso-select' : 'add-lanche-select').value;
  if (!itemId) return alert('Selecione um item.');
  try {
    await request(`/pedidos/${pedidoAtualId}/${tipo}/${itemId}`, 'POST');
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
}

async function removerItemPedido(tipo, itemId) {
  try {
    await request(`/pedidos/${pedidoAtualId}/${tipo}/${itemId}`, 'DELETE');
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
}

async function removerFilme(id) {
  if (!confirm('Deseja remover este filme?')) return;
  try {
    await request(`/filmes/${id}`, 'DELETE');
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
}

async function removerSala(id) {
  if (!confirm('Deseja remover esta sala?')) return;
  try {
    await request(`/salas/${id}`, 'DELETE');
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
}

async function removerSessao(id) {
  if (!confirm('Deseja remover esta sessão?')) return;
  try {
    await request(`/sessoes/${id}`, 'DELETE');
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('form-genero').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await request('/generos', 'POST', { nome: document.getElementById('genero-nome').value });
    e.target.reset();
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('form-filme').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await request('/filmes', 'POST', {
      titulo: document.getElementById('filme-titulo').value,
      duracao: parseInt(document.getElementById('filme-duracao').value),
      classificacao: document.getElementById('filme-class').value,
      dataIniciaExibicao: new Date(document.getElementById('filme-inicio').value).toISOString(),
      dataFinalExibicao: new Date(document.getElementById('filme-fim').value).toISOString(),
      generoId: parseInt(document.getElementById('filme-genero').value),
    });
    e.target.reset();
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('form-sala').onsubmit = async (e) => {
  e.preventDefault();
  const filas = parseInt(document.getElementById('sala-filas').value);
  const assentos = parseInt(document.getElementById('sala-assentos').value);
  const matriz = Array(filas).fill().map(() => Array(assentos).fill(1));
  try {
    await request('/salas', 'POST', { numero: document.getElementById('sala-numero').value, poltronas: matriz });
    e.target.reset();
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('form-sessao').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await request('/sessoes', 'POST', {
      filmeId: parseInt(document.getElementById('sessao-filme').value),
      salaId: parseInt(document.getElementById('sessao-sala').value),
      data: new Date(document.getElementById('sessao-data').value).toISOString(),
      valorIngresso: parseFloat(document.getElementById('sessao-valor').value),
    });
    e.target.reset();
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('form-ingresso').onsubmit = async (e) => {
  e.preventDefault();
  const fila = parseInt(document.getElementById('ingresso-fila').value);
  const assento = parseInt(document.getElementById('ingresso-assento').value);

  if (isNaN(fila) || isNaN(assento)) {
    return alert('Selecione um assento usando o mapa da sala.');
  }

  try {
    await request('/ingressos', 'POST', {
      sessaoId: parseInt(document.getElementById('ingresso-sessao').value),
      tipo: document.getElementById('ingresso-tipo').value,
      fila: fila,
      assento: assento,
    });
    alert('Ingresso gerado!');
    assentoSelecionado = null;
    const display = document.getElementById('assento-display');
    if (display) { display.textContent = 'Nenhum assento selecionado'; display.style.color = 'var(--text-muted)'; }
    e.target.reset();
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('form-pedido').onsubmit = async (e) => {
  e.preventDefault();
  const ingressos = Array.from(document.getElementById('pedido-ingressos').selectedOptions).map((o) => parseInt(o.value));
  const lancheIdsPlano = [];
  carrinhoLanches.forEach((item) => {
    for (let i = 0; i < item.quantidade; i++) lancheIdsPlano.push(item.id);
  });
  if (ingressos.length === 0 && lancheIdsPlano.length === 0) return alert('Adicione pelo menos um item.');
  try {
    await request('/pedidos', 'POST', { ingressoIds: ingressos, lancheComboIds: lancheIdsPlano });
    alert('Pedido finalizado!');
    carrinhoLanches = [];
    renderizarCarrinhoPDV();
    e.target.reset();
    carregarDados();
  } catch (err) {
    alert(err.message);
  }
};

window.addEventListener('load', verificarAcesso);
