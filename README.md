# UniFicha API - Sistema Integrado de Fichas para UBS

API RESTful para o gerenciamento e distribuição digital de fichas de atendimento em Unidades Básicas de Saúde (UBS). Desenvolvida em **Node.js** e **Express.js**, a aplicação visa digitalizar a triagem, erradicar filas presenciais de madrugada e garantir o acesso humanizado e previsível à saúde primária, com forte foco em segurança (LGPD), auditoria e controle de fraudes.

## 👩‍💻 Autores e Equipe (ECT/UFRN)

**Equipe:** Débora Nicolly, Denyson Barros, Ester Bendicto, Hallen Vinicius, Matheus Ramos, Misla Wislaine, Paulo Guilherme e Pedro Batista.
- **Instituição:** Universidade Federal do Rio Grande do Norte (UFRN);
- **Escola:** Escola de Ciências e Tecnologia (ECT);
- **Disciplina:** Ciência e Tecnologia Aplicada 3.

## 📋 Requisitos Técnicos e Arquiteturais 

O projeto foi construído sob rigorosos padrões de engenharia de software, garantindo que a aplicação não seja apenas funcional, mas escalável e segura.

**Arquitetura e Design Patterns:**
- ✅ **Separação de Responsabilidades (SoC):** Implementação de arquitetura em camadas puras (`Routes` -> `Controllers` -> `Services` -> `Repositories`);
- ✅ **Data Transfer Objects (DTOs):** Utilizados para ocultar dados sensíveis (como hashes de senhas e logs de auditoria) nas respostas HTTP, garantindo que o front-end (React) receba apenas o payload necessário.

**Segurança e Conformidade (LGPD):**
- ✅ **Identidade e Autenticação:** Sistema *stateless* utilizando **JWT (JSON Web Token)**, com expiração configurável;
- ✅ **Criptografia de Dados em Repouso:** Hashes criptográficos gerados via **Bcrypt** com *salt rounds* definidos para proteção contra ataques de força bruta;
- ✅ **Controle de Acesso Baseado em Papéis (RBAC):** Proteção de rotas em nível de middleware, garantindo que `CITIZENS` (Cidadãos) não acessem endpoints de `MANAGERS` (Gestores) ou `ADMINS`;
- ✅ **Device Fingerprinting:** Captura e validação do `Machine ID` para mitigar fraudes e a criação de "bots" de agendamento.

**Persistência e Confiabilidade:**
- ✅ **SGBD Relacional:** Uso do **PostgreSQL** garantindo propriedades ACID (Atomicidade, Consistência, Isolamento e Durabilidade), vitais para evitar *double-booking* (reservas duplicadas para a mesma vaga);
- ✅ **Validação Estrita de I/O:** Sanitização e validação de todos os dados de entrada (`req.body`, `req.params`) utilizando bibliotecas de schemas dinâmicos (ex: Zod) antes de atingirem a camada de controle.

## 📖 Documentação (Swagger)

A documentação completa dos endpoints e contratos de dados está disponível via Swagger UI:

- **URL Base (Dev):** `http://localhost:3000/api-docs`;
- Autenticação via `Bearer Token` necessária para rotas protegidas;
- Schemas DTO e modelos de persistência documentados;
- Exemplos de requisição e resposta mapeados para todos os status HTTP.

## 🏗️ Estrutura do Projeto

```text
unificha-api/
├── src/
│   ├── @types/                 # Definições de tipos customizadas (ex: estender o Request do Express)
│   ├── config/                 # Configurações globais (Banco de Dados, Variáveis de Ambiente)
│   ├── modules/                # Divisão por entidades (Domínios do sistema)
│   │   ├── users/              # Exemplo: Módulo de Usuários (Cidadãos, Agentes, Gestores)
│   │   │   ├── controllers/    # Recebe req/res e delega para o serviço
│   │   │   ├── services/       # Regras de negócio (uso do bcrypt e lógica de CRUD)
│   │   │   ├── repositories/   # Métodos específicos de consulta ao PostgreSQL
│   │   │   ├── models/         # Definição do schema da entidade (entidades)
│   │   │   ├── dtos/           # Objetos de Transferência de Dados (entrada e saída)
│   │   │   ├── validators/     # Schemas de validação de dados (ex: Zod ou Joi)
│   │   │   └── routes/         # Definição dos endpoints específicos do módulo
│   │   └── tickets/            # Exemplo: Módulo de Gerenciamento de Fichas (Entidade principal)
│   ├── shared/                 # Recursos compartilhados por toda a aplicação
│   │   ├── infra/              # Conexão com DB e drivers externos
│   │   ├── middlewares/        # Autenticação (JWT), Autorização (RBAC) e Tratamento de Erros
│   │   └── errors/             # Classe de erro customizada para o projeto
│   ├── app.js                  # Configuração central do Express (middlewares globais)
│   └── server.js               # Ponto de entrada da aplicação
├── .env                        # Credenciais sensíveis
├── .gitignore                  # Arquivos e pastas ignorados pelo Git
├── package.json                # Dependências (Express, Bcrypt, PG, etc.)
└── README.md                   # Documentação técnica da API
```

├─ src/

│  ├─ config/

│  ├─ controllers/        # Controladores da API

│  ├─ dtos/              # Data Transfer Objects

│  ├─ errors/            # 

│  ├─ middlewares/       # Middlewares (auth, validation, etc)

│  ├─ repositories/      # Camada de acesso a dados

│  ├─ routes/            # Definição das rotas

│  ├─ services/          # Lógica de negócio

│  ├─ validators/        # Validadores de entrada

│  ├─ app.js            # Configuração do Express

│  └─ server.js         # Entrada da aplicação

├─ .env 

├─ .gitignore

├─ package.json

└─ README.md

## 🔑 Autenticação e Autorização

### Autenticação

- Implementação baseada em JWT, garantindo escalabilidade sem sobrecarga de sessão no servidor;
- Tokens enviados pelo Header: `Authorization: Bearer <token>`;
- Log de auditoria (Audit Trail) que vincula a autenticação ao `machine_id` (identificador do dispositivo) do usuário logado.

### Controle de Acesso (RBAC - Papéis)

O sistema implementa três níveis hierárquicos de acesso:
1. **ADMIN (Super Usuário):** Controle total da plataforma, parametrização global e gestão de perfis gerenciais;
2. **MANAGER (Gestor/Atendente/Médico):** Administração local da UBS. Responsável por definir janelas de marcação, especialidades disponíveis e o balanceamento de cotas de fichas (prioritárias x gerais);
3. **CITIZEN (Cidadão/Usuário Comum):** Acesso à agenda pessoal, histórico de atendimentos e solicitação de fichas.

## 📦 Entidades e Modelos de Dados

### Usuários (`User`)
A entidade de usuário foi modelada para suportar tanto a flexibilidade de acesso quanto o rigor da identificação pública de saúde:
- **ID** (UUID): Identificador primário interno;
- **Nome** (`nome`): Nome completo do usuário;
- **Username** (`username`): Apelido ou nome de exibição (pode ser usado para interações na interface);
- **Login** (`login`): Credencial principal escolhida pelo usuário para acessar a plataforma;
- **Email** (`email`): Canal primário para notificações, recuperação de senha e envio de comprovantes da ficha;
- **Endereço Completo**: Incluindo Rua, Bairro, CEP, Município e Estado (fundamental para regras de territorialização);
- **CPF**: Chave natural e única, obrigatória para validação de identidade nacional;
- **Cartão do SUS (CNS)**: Chave natural única, obrigatória para vinculação ao sistema de saúde primária;
- **Senha**: Armazenada exclusivamente em formato de hash (Bcrypt);
- **Machine ID**: Assinatura criptográfica do dispositivo/navegador frequentemente utilizado pelo usuário;
- **Role**: `ADMIN`, `MANAGER` ou `CITIZEN`.

### Unidades Básicas e Configurações (`UBS` & `ScheduleConfig`)
- **ID** (UUID);
- **Nome da UBS**;
- **Localização e Endereço**: Coordenadas geográficas, Bairro, Município etc.
- **Especialidades** (Ex: Clínica Geral, Pediatria, Odontologia);
- **Política de Abrangência (Zonagem)**: Flag (booleano ou enum) que define se a UBS atende em "Livre Demanda" (aceita qualquer região) ou "Território Restrito" (somente moradores do bairro/região cadastrada);
- **Horário de Abertura/Fechamento da Fila Digital**;
- **Cotas**: Limites configuráveis para fichas `PRIORITY` e `GENERAL`.

### Fichas / Agendamentos (`Ticket`)
- **ID** (UUID);
- **Usuário ID** (Relacionamento com Cidadão);
- **Especialidade ID** (Relacionamento com Unidades Básicas e Configurações);
- **Tipo de Atendimento**: `PRIORITY` (Idoso, Gestante, PCD) ou `GENERAL`;
- **Justificativa (Opcional)**: Campo de texto livre para o paciente descrever brevemente o motivo da consulta (ex: "Renovação de receita", "Febre há 3 dias"), auxiliando na pré-triagem;
- **Status**: `RESERVED`, `COMPLETED`, `CANCELED`, `NO_SHOW` (Não compareceu);
- **Timestamp de Emissão e Auditoria**.

## 📜 Regras de Negócio e Casos de Uso (Camada Service)

As regras abaixo refletem as diretrizes do projeto para garantir um sistema justo, auditável e à prova de cambismo. Toda essa lógica reside isoladamente na pasta `src/services/`.

### 1. Sistema Dinâmico de Cotas e Prioridades
A distribuição de fichas não é estática. A API impõe uma validação rigorosa de cotas:
- **Regra Base:** O sistema obedece a um limite predefinido (ex: 4 fichas `PRIORITY` e 6 fichas `GENERAL` por janela);
- **Sobrescrita Gerencial:** Um usuário com role `MANAGER` pode alterar essa proporção a qualquer momento (ex: adaptar para 5/5 devido a um mutirão de vacinação de idosos) e a API recalculada imediatamente a disponibilidade para os usuários;
- **Trava de Cota:** Se as fichas `PRIORITY` esgotarem, pacientes prioritários não podem "roubar" automaticamente vagas `GENERAL` (ou vice-versa) sem autorização prévia da parametrização do gestor.

### 2. Bloqueio Transacional Anti-Cambismo
Para evitar a comercialização de vagas ou o monopólio de agendamentos:
- **Limite Diário:** A API valida no repositório se o `CPF` / `Cartão do SUS` já possui uma ficha ativa para o mesmo dia e UBS. O agendamento simultâneo para a mesma especialidade é sumariamente bloqueado (Erro 409 Conflict);
- **Rastreabilidade por Dispositivo (`Machine ID`):** Se o sistema detectar múltiplas emissões de fichas para *diferentes CPFs* originadas de uma mesma máquina/IP em um curtíssimo espaço de tempo (comportamento de "cambista" ou bot), o fluxo é temporariamente suspenso e um flag de auditoria é gerado.

### 3. Integração de Histórico e Previsibilidade
- **Agenda do Cidadão:** O usuário (`CITIZEN`) consome um endpoint específico que cruza seus dados e retorna duas matrizes: **Histórico Passado** (fichas concluídas e no-shows) e **Agendamentos Futuros** (com timer, status e número de chamada); 
- **Penalidade de No-Show:** A regra de negócio permite que o gestor marque uma ficha como `NO_SHOW`. A API pode ser configurada para limitar agendamentos futuros de cidadãos com alto índice de faltas consecutivas.

### 4. Parametrização Exclusiva por Gestores e Admins
- A criação de Especialidades, definição de capacidade de atendimento e horários de abertura das "janelas" de marcação de ficha são rotas protegidas. O Service verifica o `req.user.role` e rejeita qualquer tentativa de manipulação que não venha de um `MANAGER` daquela UBS específica ou de um `ADMIN` global.

### 5. Política de Territorialização (Zonagem do SUS)
O sistema automatiza a triagem geográfica para otimizar o fluxo da rede municipal de saúde:
- **Atendimento Restrito:** Se a UBS estiver configurada para atender apenas seu território, o Service cruza o bairro cadastrado no perfil do `CITIZEN` com a área de abrangência da UBS. Usuários de fora recebem um aviso (Status 403 Forbidden para a ação) indicando qual a sua UBS de referência;
- **Exceções e Livre Demanda:** O `MANAGER` pode configurar especialidades específicas (ex: campanhas de vacinação ou farmácia) para aceitarem pessoas de outros bairros ou cidades, flexibilizando a regra de bloqueio geográfico.

### 6. Triagem Humanizada (Justificativa Própria)
- Durante a emissão da ficha, o `CITIZEN` pode preencher um campo opcional de justificativa;
- Embora não garanta "fura-fila" automático no sistema digital, esse dado é exibido no painel do `MANAGER` ou enfermeiro da triagem, permitindo que a equipe da UBS identifique casos agudos silenciosos (ex: suspeita de dengue) antes mesmo do paciente chegar à unidade física.

## ✅ Validações (Camada Validators)

- **CPF:** Algoritmo de validação de CPF nacional, rejeitando formatações falsas.
- **CNS (Cartão SUS):** Validação de comprimento e módulo 11, conforme padrão do Ministério da Saúde.
- **Senhas:** Mínimo de 8 caracteres, contemplando políticas de força.
- **Conflito de Horários:** Bloqueio transacional no banco de dados para impedir *double-booking* (duas pessoas pegando a mesma vaga exata).

## 🚨 Tratamento de Erros (Camada Middlewares)

Todos os erros lançados pelos Services são capturados por um middleware global que formata a resposta e mapeia o Status HTTP adequado:

- **200/201:** Operação bem-sucedida / Recurso criado;
- **400 (Bad Request):** Falha na validação do Zod (ex: CPF inválido);
- **401 (Unauthorized):** Token JWT expirado, ausente ou Machine ID não confere;
- **403 (Forbidden):** Cidadão tentando acessar rota de Gestor;
- **404 (Not Found):** Especialidade ou Ficha não localizada;
- **409 (Conflict):** Violação de cota ou usuário tentando emitir 2ª ficha no mesmo dia indevidamente;
- **422 (Unprocessable Entity):** Erros de lógica de negócio em geral;
- **500 (Internal Server Error):** Falhas críticas ou quedas no PostgreSQL (com geração de logs em ambiente dev).

## 📚 Stack Tecnológica e Dependências

- `express`: Minimalista e rápido para orquestração de rotas HTTP;
- `pg` (node-postgres): Comunicação de baixo nível e alta performance com o banco;
- `zod`: Declaração de schemas e validação *Type-safe*;
- `bcrypt`: Algoritmo seguro de hashing (fator de custo configurável);
- `jsonwebtoken`: Padrão RFC 7519 para tokens de acesso;
- `swagger-ui-express` & `swagger-jsdoc`: Geração dinâmica de especificações OpenAPI.