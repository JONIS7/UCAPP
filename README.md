# Controle de Vencimento de Medicamentos

Uma aplicação web para ajudar colaboradores a controlar a data de validade de produtos, com integração com a Agenda Google para lembretes automáticos.

![Demonstração do App](https://raw.githubusercontent.com/JONIS7/UCAPP/main/gif%20github.gif)

---

## 🚀 Sobre o Projeto

Esta aplicação foi desenvolvida como uma solução simples e eficaz para a gestão de validades no ambiente de trabalho. O principal objetivo é fornecer uma ferramenta de fácil utilização para que os colaboradores possam registar produtos e receber notificações automáticas na sua Agenda Google antes do vencimento, garantindo que os itens sejam retirados da área de vendas a tempo e evitando perdas.

---

## ✨ Funcionalidades

* **Login Seguro:** Autenticação de utilizador através da conta Google.
* **Registo de Medicamentos:** Adicionar novos medicamentos com nome, data de validade e imagem opcional.
* **Captura de Imagem:** Opção de usar a câmara do dispositivo ou escolher uma foto da galeria.
* **Sistema de Alertas Inteligente:** A aplicação verifica automaticamente os medicamentos a vencer em 15 e 30 dias.
* **Sincronização com Google Agenda:** Criação de eventos de lembrete na agenda do utilizador para os itens pendentes.
* **Armazenamento Local Persistente:** Os dados ficam guardados no navegador (`localStorage`), para que não se percam ao fechar a página.
* **Exclusão com Confirmação:** Permite apagar medicamentos de forma segura.
* **Design Responsivo:** A interface adapta-se a telemóveis, tablets e desktops.
* **Interface Detalhada:** Clicar num card abre um pop-up (modal) com os detalhes do medicamento.

---

## 💻 Tecnologias Utilizadas

* HTML5
* CSS3 (com Bootstrap 5)
* JavaScript (ES6+)
* Google Identity Services (para login)
* Google Calendar API (para eventos)
* `localStorage` (para armazenamento de dados no navegador)

---

## ⚙️ Como Executar o Projeto

1.  Faça o clone ou o download deste repositório.
2.  Abra o ficheiro `index.html` num navegador web (recomenda-se o uso de uma extensão como o Live Server para desenvolvimento local).
