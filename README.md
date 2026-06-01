# UniFicha API - Sistema Integrado de Fichas para UBS

API RESTful de alta performance para o gerenciamento e distribuição digital de fichas de atendimento em Unidades Básicas de Saúde (UBS). Desenvolvida sobre o ecossistema **Node.js** com o framework **Express.js** e integrada ao ORM **Prisma**, a aplicação visa erradicar filas presenciais de madrugada e garantir o acesso humanizado, previsível e seguro à saúde primária, com estrita conformidade com a LGPD, auditoria e mitigação ativa de fraudes eletrônicas.

## 👩‍💻 Autores e Equipe (ECT/UFRN)

**Equipe:** Débora Nicolly, Denyson Barros, Ester Bendicto, Hallen Vinicius, Matheus Ramos, Misla Wislaine, Paulo Guilherme e Pedro Batista.
- **Instituição:** Universidade Federal do Rio Grande do Norte (UFRN);
- **Escola:** Escola de Ciências e Tecnologia (ECT);
- **Disciplina:** Ciência e Tecnologia Aplicada 3.

## 📋 Requisitos Técnicos e Arquiteturais

O projeto foi construído sob rigorosos padrões de engenharia de software, garantindo acoplamento fraco entre as camadas, escalabilidade horizontal e segurança resiliente.

**Arquitetura e Design Patterns:**
- ✅ **Arquitetura em Camadas (Layered Architecture):** Implementação baseada no desacoplamento estrito de responsabilidades onde o fluxo de dados atravessa linearmente barreiras isoladas da aplicação (`Rotas` -> `Controladores` -> `Serviços` -> `Repositórios`);
- ✅ **Data Transfer Objects (DTOs):** Higienização estrita de payloads na camada de apresentação. Todas as entidades (`Usuario`, `Ubs`, `ConfiguracaoAgenda`, `Ficha`) possuem DTOs dedicados para mascarar colunas sensíveis (hashes de senhas, carimbos de exclusão lógica e logs de auditoria como IPs internos e assinaturas de hardware) antes do envio da resposta HTTP;
- ✅ **Especialização de Camada de Serviço:** A camada de regras de negócio do domínio de usuários é categorizada e organizada em subdiretórios por afinidade conceitual e semântica: `auth` (autenticação de sessões), `management` (gerenciamento e ciclo de vida de dados cadastrais) e `security` (mecanismos de defesa, redefinições e tokens de segurança).

**Segurança Avançada e Conformidade (LGPD / Diretrizes OWASP):**
- ✅ **Autenticação Multi-Role (Acúmulo de Papéis):** Suporte nativo a perfis compostos. Um mesmo registro de usuário pode acumular múltiplos cargos no sistema (ex: `['GESTOR', 'CIDADAO']` ou `['AGENTE', 'CIDADAO']`), unificando sua identidade e acumulando privilégios de forma transparente nas camadas superiores;
- ✅ **Autenticação Híbrida de Entrada:** Flexibilidade de acesso baseada em âncoras imutáveis. A camada de autenticação valida as credenciais tanto pelo apelido (`login`) quanto pelo `CPF`, eliminando bloqueios por esquecimento de credenciais;
- ✅ **Challenge-Response Device Tracking:** Proteção rígida contra roubo de sessões e hijacking. A alteração ou registro de um novo identificador físico de dispositivo (`idMaquina`) exige re-autenticação por senha atual combinada a um token temporário OTP (One-Time Password) de 6 dígitos enviado ao e-mail do usuário;
- ✅ **Criptografia e Fluxos de Recuperação Seguros:** Hashes gerados via **Bcrypt** com fator de custo computacional otimizado na camada de persistência. Recuperação de credenciais via tokens criptográficos aleatórios de uso único com expiração em tempo curto (1 hora), blindados contra ataques de lançamento e enumeração de e-mails.

**Persistência, Confiabilidade e Tempo Real:**
- ✅ **Conexões Persistentes Autenticadas (WebSockets):** Sincronização em tempo real da fila do dia, painéis de chamada e atualizações dos cards de agendamento via **Socket.IO**. Toda conexão WebSocket passa por um middleware de interceptação que valida o token JWT (`socket.handshake.auth.token`) antes do handshake;
- ✅ **SGBD Relacional ACID:** Uso do **PostgreSQL** orquestrado via Prisma PgAdapter na camada de dados, garantindo isolamento transacional rígido e impedindo cenários de *double-booking* de vagas;
- ✅ **Tratamento de Exceções Nativo do Engine:** O barramento global de erros intercepta falhas conhecidas de restrição de unicidade da camada de persistência (Prisma Error `P2002` e `P2025`), convertendo falhas de infraestrutura em respostas legíveis com status HTTP 409 (Conflict) e 404 (Not Found).

## 🏗️ Estrutura do Projeto

```text
unificha-api/
├── prisma/
│   ├── schema.prisma           # Modelagem de dados, enums e mapeamento do PostgreSQL
│   └── migrations/             # Histórico de evolução controlado do banco de dados
├── src/
│   ├── app.js                  # Configuração central do Express e acoplamento de middlewares
│   ├── server.js               # Inicializador do HTTP Server e Bootstrap do Socket.IO
│   ├── config/                 # Parametrizadores globais (JWT, Adapter Postgres, Socket.IO)
│   ├── controllers/            # Camada de Controle: Captura de I/O, delegação e mapeamento DTO
│   ├── dtos/                   # Objetos de Transferência de Dados (Usuario, Ubs, Agenda, Ficha)
│   ├── errors/                 # Classe de exceções personalizadas de regras de negócio
│   ├── middlewares/            # Interceptadores: Filtros de autenticação, RBAC Composto e Erros
│   ├── repositories/           # Camada de Dados: Queries estritas e isoladas do Prisma
│   ├── routes/                 # Camada de Rotas: Endpoints Express divididos por contexto
│   ├── utils/                  # Scripts utilitários de inicialização (Seed de Super Admin)
│   ├── validators/             # Schemas Zod para sanitização e validação Type-safe de I/O
│   └── services/               # Camada de Serviço: Casos de Uso e Regras de Negócio do Domínio
│       ├── agenda/             # Criação e atualização de janelas de atendimento
│       ├── ubs/                # Regras de cadastro e alteração de unidades
│       ├── fichas/             # Motor transacional de emissão e auditoria de fichas
│       └── usuarios/           # Especialização da Camada de Serviço de Usuários
│           ├── auth/           # Autenticação e assinatura de tokens
│           ├── management/     # Regras de gerenciamento cadastral e ciclo de vida
│           └── security/       # Alteração de senhas, OTP de dispositivo e resets

```

## 🔑 Controle de Acesso Baseado em Papéis Compostos (Multi-Role RBAC)

O ecossistema valida os privilégios varrendo um array de permissões injetado dentro do payload do token JWT:

1. **`ADMIN`:** Controle total da plataforma em nível municipal/estadual, parametrização global de abrangências, gestão de staff e execução de remoções físicas (*Hard Delete*);
2. **`GESTOR`:** Administração operacional local da UBS. Responsável por parametrizar janelas de marcação, especialidades clínicas, balanceamento dinâmico de cotas e controle da fila de chamadas em tempo real;
3. **`AGENTE`:** Perfil assistencial proxy. Permite que o agente de saúde emita fichas de atendimento em nome de terceiros (cidadãos sem acesso digital ou vulneráveis), vinculando o ato ao seu dispositivo auditável;
4. **`CIDADAO`:** Perfil padrão de autoatendimento. Permite gerenciar a própria agenda de saúde, histórico pessoal e solicitar/cancelar suas próprias fichas.

## 📦 Entidades e Modelos de Dados

### Usuários (`usuarios`)

* **ID** (UUID, Chave Primária Interna);
* **Nome Completo** (`nome_completo`) e Nome Social (`nome_social`);
* **Login** (`login`, Único) e **CPF** (`cpf`, Único e imutável);
* **Cartão Nacional de Saúde** (`cns`, Único e imutável);
* **Email** (`email`) e Senha Hash (`senha_hash`);
* **Endereço Territorializado**: Logradouro, Bairro, CEP, Município e UF (Obrigatórios);
* **Perfim/Papéis** (`perfis`, Array de Enums `TipoPerfil`);
* **Machine ID** (`id_maquina`, Assinatura de hardware vinculada);
* **Campos de Recuperação**: `reset_password_token`, `reset_password_expires`, `codigo_dispositivo`, `codigo_dispositivo_expires`.

### Unidades Básicas (`ubs`)

* **ID** (UUID);
* **Nome da Unidade** (`nome`);
* **Coordenadas Geográficas** (`latitude`, `longitude` para rastreamento espacial);
* **Território de Atuação**: Bairro e Município;
* **Política de Abrangência** (`politica_atendimento`): Enum (`MUNICIPAL`, `ESTADUAL`, `FEDERAL`).

### Configurações de Agenda (`configuracoes_agenda`)

* **ID** (UUID) e ID da UBS (Relacionamento de Chave Estrangeira);
* **Especialidade** (Ex: Clínica Geral, Odontologia, Pediatria);
* **Janela de Funcionamento**: `horario_abertura` e `horario_fechamento`;
* **Cotas de Distribuição**: Limite numérico configurável para `cota_prioritaria` e `cota_geral`;
* **Limite Dinâmico por Cidadão** (`limite_fichas_por_cidadao`, Padrão: 3): Trava configurável por gestores para limitar emissões por CPF/dia na unidade.

### Fichas de Atendimento (`fichas`)

* **ID** (UUID);
* **Relacionamentos**: Usuário (Cidadão) e Configuração da Agenda;
* **Data do Atendimento** (`data_atendimento`);
* **Tipo de Cota**: Enum (`NORMAL`, `PRIORITARIA`);
* **Justificativa**: Texto opcional do paciente para pré-triagem de casos agudos;
* **Status da Ficha**: Enum (`PENDENTE`, `CONCLUIDA`, `CANCELADA`);
* **Campos de Auditoria Exclusivos**: `auditoria_id_maquina` e `auditoria_ip`.

## 📜 Regras de Negócio Implementadas (Camada de Serviço)

### RN-01: Sobrescrita Gerencial de Parâmetros

O gerenciamento de vagas é dinâmico. Usuários com o papel `GESTOR` vinculados à unidade ou `ADMIN` globais podem atualizar a capacidade das cotas (`cotaGeral`, `cotaPrioritaria`) ou alterar o limite diário de fichas por cidadão a qualquer momento, recalculando imediatamente a disponibilidade na API sem necessidade de reinicializar a aplicação.

### RN-02: Bloqueio Anti-Cambismo Dinâmico

A API impede o monopólio e comércio de vagas executando uma query de agregação no momento da solicitação. A camada de serviço conta os agendamentos ativos do cidadão para a data alvo através do repositório. Se o total atingir ou ultrapassar o valor configurado no campo `limiteFichasPorCidadao` daquela agenda específica, a operação é abortada retornando um erro 409 (Conflict).

### RN-03: Triagem Geográfica Semântica (Territorialização)

O `CreateFichaService` automatiza a validação das diretrizes de zonagem do SUS ao cruzar os dados de endereço do cidadão com a política da UBS:

* Política **`MUNICIPAL`**: O sistema valida se o município do usuário é idêntico ao da UBS (comparações sanitizadas via `.toLowerCase().trim()`). Divergências bloqueiam a emissão com status 403 (Forbidden);
* Política **`ESTADUAL`**: O sistema valida se a UF (Estado) do usuário corresponde à da UBS;
* Política **`FEDERAL`**: Toda validação geográfica é pulada, permitindo livre demanda de agendamento nacional (utilizado para campanhas de vacinação em massa ou farmácia central).

### RN-04: Imutabilidade de Fichas Finalizadas

Uma vez que o status de uma ficha de atendimento é alterado pelo gestor para `CONCLUIDA` ou cancelado pelo usuário/sistema para `CANCELADA`, o registro torna-se estritamente imutável. Qualquer tentativa subsequente de modificação de dados ou status disparará uma exceção 422 (Unprocessable Entity).

### RN-05: Imutabilidade Cadastral de Segurança

Em conformidade com padrões de auditoria contra fraudes eletrônicas, os campos `login`, `cpf`, `cns` e o histórico de logs de hardware originais tornam-se completamente imutáveis após a persistência inicial do cadastro, não sendo afetados por rotas de atualização parcial (PATCH/PUT).

## 🚨 Mapeamento Coerente de Status HTTP

O middleware global `errorHandler.js` intercepta exceções vindas das camadas internas e formata o payload de saída sob os seguintes padrões:

* **200 (OK) / 201 (Created):** Sucesso absoluto / Recurso persistido de forma íntegra;
* **400 (Bad Request):** Erro de validação estrutural capturado pelo Zod na camada de validação (retorna um array detalhado contendo os campos e as mensagens de erro correspondentes);
* **401 (Unauthorized):** Token JWT inválido, expirado ou assinatura física de dispositivo (`x-machine-id`) em desconformidade com a registrada no payload;
* **403 (Forbidden):** Violação de privilégios do RBAC Composto ou bloqueio por diretrizes de territorialização geográfica;
* **404 (Not Found):** Registro solicitado não localizado nas buscas de ID ou capturado pelo erro de infraestrutura `P2025` do Prisma;
* **409 (Conflict):** Conflito de dados de entrada. Disparado por violação de cotas esgotadas, limite diário estourado ou capturado por falha de chave única do banco de dados (Prisma `P2002` - ex: CPF ou CNS já existentes);
* **422 (Unprocessable Entity):** Erro de consistência lógica de negócio (ex: horário de abertura posterior ou igual ao de fechamento, ou tentativa de alteração de registro imutável);
* **500 (Internal Server Error):** Falhas críticas de infraestrutura ou queda de conexão com o PostgreSQL, mascarando detalhes internos do servidor na camada de apresentação e gerando logs estruturados via Pino Logger em ambiente de desenvolvimento.