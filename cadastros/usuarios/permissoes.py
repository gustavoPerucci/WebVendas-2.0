# -*-encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from cadastros.usuarios.models import Usuarios, Permissoes
from cadastros.usuarios.forms import FormPermissoesUsuarios
from django.http import HttpResponse
from django.http import QueryDict
import json
from functions.views import deserialize_form
from functions.views import mensagem_erro_padrao, titulo_mensagem_erro_padrao, mensagem_permissao_negada, titulo_mensagem_permissao_negada


@login_required
def cadastrar_permissao_usuario(request):
    permissao_id = request.POST.get('id')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    if permissao_id != '0':
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.edita_permissoes_usuario:
            sucesso['negado'] = 1
            sucesso['mensagem'] = mensagem_permissao_negada()
            sucesso['titulo'] = titulo_mensagem_permissao_negada()
            retorno = json.dumps(sucesso)
            return HttpResponse(retorno, content_type="application/json")
        else:
            permissao = Permissoes.objects.get(id=int(permissao_id))
    else:
        permissao = None
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.cadastra_permissoes_usuario:
            sucesso['negado'] = 1
            sucesso['mensagem'] = mensagem_permissao_negada()
            sucesso['titulo'] = titulo_mensagem_permissao_negada()
            retorno = json.dumps(sucesso)
            return HttpResponse(retorno, content_type="application/json")

    if request.method == 'POST':
        form = FormPermissoesUsuarios(deserialize_form(request.POST.get('form')), instance=permissao)

        if form.is_valid():
            registro = form.save(commit=False)

            if not permissao_id != '0':
                registro.empresa = usuario.empresa
                registro.usuario = request.user
                titulo_mensagem = 'SALVANDO REGISTRO...'
                mensagem = 'O registro foi salvo com sucesso !!!'
            else:
                titulo_mensagem = 'ALTERANDO REGISTRO...'
                mensagem = 'O registro foi alterado com sucesso!!!'

            registro.save()

            sucesso['success'] = True
            sucesso['mensagem'] = mensagem
            sucesso['id'] = registro.id
            sucesso['titulo'] = titulo_mensagem
            retorno = json.dumps(sucesso)

        else:
            cont = 0
            for error in form.errors:
                erro += {error}
                cont += 1
            titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS . . .'
            mensagem = '''O formulário apresentou erros no seu preenchimento.
                       Corrija os campos listados em vermelho e tente novamente. . .'''

            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
                'cont': cont,
            })
    return HttpResponse(retorno, content_type="application/json")


def buscar_permissoes_usuarios(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    tb_permissoes = {}
    mensagem = ''
    permissoes = []
    classe = ''
    titulo = 'BUSCANDO PERMISSÕES DE USUÁRIOS...'

    if usuario.permissoes.acessa_permissoes_usuario:
        tb_permissoes = Permissoes.objects.filter(empresa=usuario.empresa,
                                                  administrador=0,
                                                  administrador_super=0)
    if usuario.permissoes.administrador:
        tb_permissoes = Permissoes.objects.filter(empresa=usuario.empresa,
                                                  administrador_super=0)
    if usuario.permissoes.administrador_super:
        tb_permissoes = Permissoes.objects.filter()

    for index in tb_permissoes:
        usuarios = ''
        permissoes_usuarios = ''
        colaboradores = ''
        clientes = ''
        produtos = ''
        fornecedores = ''
        tabela_precos = ''
        vendas = ''
        compras = ''
        contas_pagar = ''
        contas_receber = ''
        saida_produtos = ''
        entrada_produtos = ''
        recebimentos = ''
        pagamentos = ''
        mensagens_site = ''
        conteudo_site = ''
        if index.status == 'ATIVO':
            classe = 'success'
        else:
            classe = 'danger'

        # inicio cadastro de colaboradores
        if index.cadastra_colaborador:
            colaboradores += 'Cadastra(SIM)'
        else:
            colaboradores += 'Cadastra(NÃO)'

        if index.edita_colaborador:
            colaboradores += ', Edita(SIM)'
        else:
            colaboradores += ', Edita(NÃO)'

        if index.muda_status_colaborador:
            colaboradores += ', Muda státus(SIM)'
        else:
            colaboradores += ', Muda státus(NÃO)'

        if index.acessa_cadastro_colaboradores:
            colaboradores += ', Acessa cadastro(SIM)'
        else:
            colaboradores += ', Acessa cadastro(NÃO)'
        # fim cadastro de colaboradores

        # inicio cadastro de usuarios
        if index.cadastra_usuario:
            usuarios += 'Cadastra(SIM)'
        else:
            usuarios += 'Cadastra(NÃO)'

        if index.edita_usuario:
            usuarios += ', Edita(SIM)'
        else:
            usuarios += ', Edita(NÃO)'

        if index.muda_status_usuario:
            usuarios += ', Muda státus(SIM)'
        else:
            usuarios += ', Muda státus(NÃO)'

        if index.acessa_cadastro_usuarios:
            usuarios += ', Acessa cadastro(SIM)'
        else:
            usuarios += ', Acessa cadastro(NÃO)'
        # fim cadastro de usuarios


        # inicio cadastro de clientes
        if index.cadastra_cliente:
            clientes += 'Cadastra(SIM)'
        else:
            clientes += 'Cadastra(NÃO)'

        if index.edita_cliente:
            clientes += ', Edita(SIM)'
        else:
            clientes += ', Edita(NÃO)'

        if index.muda_status_cliente:
            clientes += ', Muda státus(SIM)'
        else:
            clientes += ', Muda státus(NÃO)'

        if index.acessa_cadastro_cliente:
            clientes += ', Acessa cadastro(SIM)'
        else:
            clientes += ', Acessa cadastro(NÃO)'
        # fim cadastro de clientes

        # inicio cadastro de fornecedores
        if index.cadastra_fornecedor:
            fornecedores += 'Cadastra(SIM)'
        else:
            fornecedores += 'Cadastra(NÃO)'
        if index.edita_fornecedor:
            fornecedores += ', Edita(SIM)'
        else:
            fornecedores += ', Edita(NÃO)'
        if index.muda_status_fornecedor:
            fornecedores += ', Muda státus(SIM)'
        else:
            fornecedores += ', Muda státus(NÃO)'
        if index.acessa_cadastro_fornecedor:
            fornecedores += ', Acessa cadastro(SIM)'
        else:
            fornecedores += ', Acessa cadastro(NÃO)'
        # fim cadastro de fornecedores

        # inicio cadastro de produtos
        if index.cadastra_produto:
            produtos += 'Cadastra(SIM)'
        else:
            produtos += 'Cadastra(NÃO)'
        if index.edita_produto:
            produtos += ', Edita(SIM)'
        else:
            produtos += ', Edita(NÃO)'
        if index.muda_status_produto:
            produtos += ', Muda státus(SIM)'
        else:
            produtos += ', Muda státus(NÃO)'
        if index.acessa_cadastro_produto:
            produtos += ', Acessa cadastro(SIM)'
        else:
            produtos += ', Acessa cadastro(NÃO)'
        if index.altera_preco_produto:
            produtos += ', Altera preço(SIM)'
        else:
            produtos += ', Altera preço(NÃO)'
        if index.anuncia_produto:
            produtos += ', Anuncia produto(SIM)'
        else:
            produtos += ', Anuncia produto(NÃO)'
        # fim cadastro de produtos

        # inicio tabela de precos
        if index.tabela_preco:
            tabela_precos += 'Tabela preço(SIM)'
        else:
            tabela_precos += 'Tabela preço(NÃO)'
        if index.edita_tabela_de_precos:
            tabela_precos += ', Edita(SIM)'
        else:
            tabela_precos += ', Edita(NÃO)'
        if index.exclui_preco_tabelado:
            tabela_precos += ', Exclui(SIM)'
        else:
            tabela_precos += ', Exclui(NÃO)'
        if index.acessa_tabela_de_precos:
            tabela_precos += ', Acessa(SIM)'
        else:
            tabela_precos += ', Acessa(NÃO)'
        # fim tabela de precos

        # inicio registro de vendas
        if index.registra_venda:
            vendas += 'Registra(SIM)'
        else:
            vendas += 'Registra(NÃO)'
        if index.edita_venda:
            vendas += ', Edita(SIM)'
        else:
            vendas += ', Edita(NÃO)'
        if index.fecha_venda:
            vendas += ', Fecha(SIM)'
        else:
            vendas += ', Fecha(NÃO)'
        if index.acessa_registro_venda:
            vendas += ', Acessa(SIM)'
        else:
            vendas += ', Acessa(NÃO)'
        if index.muda_status_venda:
            vendas += ', Muda státus(SIM)'
        else:
            vendas += ', Muda státus(NÃO)'
        if index.cancela_venda:
            vendas += ', Cancela(SIM)'
        else:
            vendas += ', Cancela(NÃO)'
        if index.imprime_cupom_venda:
            vendas += ', Imprime cupom(SIM)'
        else:
            vendas += ', imprime cupom(NÃO)'
        # fim registro de vendas

        # inicio registro de compras
        if index.registra_compra:
            compras += 'Registra(SIM)'
        else:
            compras += 'Registra(NÃO)'
        if index.edita_compra:
            compras += ', Edita(SIM)'
        else:
            compras += ', Edita(NÃO)'
        if index.finaliza_compra:
            compras += ', Finaliza(SIM)'
        else:
            compras += ', Finaliza(NÃO)'
        if index.acessa_registro_compra:
            compras += ', Acessa(SIM)'
        else:
            compras += ', Acessa(NÃO)'
        if index.muda_status_compra:
            compras += ', Muda státus(SIM)'
        else:
            compras += ', Muda státus(NÃO)'
        if index.cancela_compra:
            compras += ', Cancela(SIM)'
        else:
            compras += ', Cancela(NÃO)'
        # fim registro de compras

        # inicio contas a pagar
        if index.quita_contas_pagar:
            contas_pagar += 'Quita(SIM)'
        else:
            contas_pagar += 'Quita(NÃO)'
        if index.edita_contas_pagar:
            contas_pagar += ', Edita(SIM)'
        else:
            contas_pagar += ', Edita(NÃO)'
        if index.exclui_contas_pagar:
            contas_pagar += ', Exclui(SIM)'
        else:
            contas_pagar += ', Exclui(NÃO)'
        if index.acessa_contas_pagar:
            contas_pagar += ', Acessa(SIM)'
        else:
            contas_pagar += ', Acessa(NÃO)'
        # fim contas a pagar

        # inicio contas a receber
        if index.quita_contas_receber:
            contas_receber += 'Quita(SIM)'
        else:
            contas_receber += 'Quita(NÃO)'
        if index.edita_contas_receber:
            contas_receber += ', Edita(SIM)'
        else:
            contas_receber += ', Edita(NÃO)'
        if index.exclui_contas_receber:
            contas_receber += ', Exclui(SIM)'
        else:
            contas_receber += ', Exclui(NÃO)'
        if index.acessa_contas_receber:
            contas_receber += ', Acessa(SIM)'
        else:
            contas_receber += ', Acessa(NÃO)'
        # fim contas a receber

        # inicio saida de produtos
        if index.registra_saida_produto:
            saida_produtos += 'Registra(SIM)'
        else:
            saida_produtos += 'Registra(NÃO)'
        if index.edita_saida_produto:
            saida_produtos += ', Edita(SIM)'
        else:
            saida_produtos += ', Edita(NÃO)'
        if index.acessa_saida_produto:
            saida_produtos += ', Acessa(SIM)'
        else:
            saida_produtos += ', Acessa(NÃO)'
        if index.muda_status_saida_produto:
            saida_produtos += ', Muda státus(SIM)'
        else:
            saida_produtos += ', Muda státus(NÃO)'
        if index.cancela_saida_produto:
            saida_produtos += ', Cancela(SIM)'
        else:
            saida_produtos += ', Cancela(NÃO)'
        # fim saida de produtos

        # inicio entrada de produtos
        if index.registra_entrada_produto:
            entrada_produtos += 'Registra(SIM)'
        else:
            entrada_produtos += 'Registra(NÃO)'
        if index.edita_entrada_produto:
            entrada_produtos += ', Edita(SIM)'
        else:
            entrada_produtos += ', Edita(NÃO)'
        if index.acessa_entrada_produto:
            entrada_produtos += ', Acessa(SIM)'
        else:
            entrada_produtos += ', Acessa(NÃO)'
        if index.muda_status_entrada_produto:
            entrada_produtos += ', Muda státus(SIM)'
        else:
            entrada_produtos += ', Muda státus(NÃO)'
        if index.cancela_entrada_produto:
            entrada_produtos += ', Cancela(SIM)'
        else:
            entrada_produtos += ', Cancela(NÃO)'
        # fim entrada de produtos

        # inicio registro de pagamentos
        if index.registra_pagamento:
            pagamentos += 'Registra(SIM)'
        else:
            pagamentos += 'Registra(NÃO)'
        if index.edita_pagamento:
            pagamentos += ', Edita(SIM)'
        else:
            pagamentos += ', Edita(NÃO)'
        if index.acessa_pagamento:
            pagamentos += ', Acessa(SIM)'
        else:
            pagamentos += ', Acessa(NÃO)'
        if index.muda_status_pagamento:
            pagamentos += ', Muda státus(SIM)'
        else:
            pagamentos += ', Muda státus(NÃO)'
        if index.exclui_pagamento:
            pagamentos += ', Exclui(SIM)'
        else:
            pagamentos += ', Exclui(NÃO)'
        # fim registro de pagamentos

        # inicio registro de recebimentos
        if index.registra_recebimento:
            recebimentos += 'Registra(SIM)'
        else:
            recebimentos += 'Registra(NÃO)'
        if index.edita_recebimento:
            recebimentos += ', Edita(SIM)'
        else:
            recebimentos += ', Edita(NÃO)'
        if index.acessa_recebimento:
            recebimentos += ', Acessa(SIM)'
        else:
            recebimentos += ', Acessa(NÃO)'
        if index.muda_status_recebimento:
            recebimentos += ', Muda státus(SIM)'
        else:
            recebimentos += ', Muda státus(NÃO)'
        if index.exclui_recebimento:
            recebimentos += ', Exclui(SIM)'
        else:
            recebimentos += ', Exclui(NÃO)'
        # fim registro de recebimentos

        # inicio publicacao de mensagens do site
        if index.publica_mensagem_site:
            mensagens_site += 'Publica(SIM)'
        else:
            mensagens_site += 'Publica(NÃO)'
        if index.edita_mensagem_site:
            mensagens_site += ', Edita(SIM)'
        else:
            mensagens_site += ', Edita(NÃO)'
        if index.acessa_mensagem_site:
            mensagens_site += ', Acessa(SIM)'
        else:
            mensagens_site += ', Acessa(NÃO)'
        if index.muda_status_mensagem_site:
            mensagens_site += ', Muda státus(SIM)'
        else:
            mensagens_site += ', Muda státus(NÃO)'
        if index.exclui_mensagem_site:
            mensagens_site += ', Exclui(SIM)'
        else:
            mensagens_site += ', Exclui(NÃO)'
        # fim publicacao de mensagens do site

        # inicio publicacao de conteudo do site
        if index.publica_conteudo_site:
            conteudo_site += 'Publica(SIM)'
        else:
            conteudo_site += 'Publica(NÃO)'
        if index.edita_conteudo_site:
            conteudo_site += ', Edita(SIM)'
        else:
            conteudo_site += ', Edita(NÃO)'
        if index.acessa_conteudo_site:
            conteudo_site += ', Acessa(SIM)'
        else:
            conteudo_site += ', Acessa(NÃO)'
        if index.muda_status_conteudo_site:
            conteudo_site += ', Muda státus(SIM)'
        else:
            conteudo_site += ', Muda státus(NÃO)'
        if index.exclui_conteudo_site:
            conteudo_site += ', Exclui(SIM)'
        else:
            conteudo_site += ', Exclui(NÃO)'
            # fim publicacao de conteudo do site

        if index.administrador:
            administrador = 'SIM'
            administrador_super = 'NÃO'
            usuarios = 'Sem restrições'
            colaboradores = 'Sem restrições'
            permissoes_Usuarios = 'Sem restrições'
            clientes = 'Sem restrições'
            produtos = 'Sem restrições'
            fornecedores = 'Sem restrições'
            tabela_precos = 'Sem restrições'
            vendas = 'Sem restrições'
            compras = 'Sem restrições'
            contas_pagar = 'Sem restrições'
            contas_receber = 'Sem restrições'
            saida_produtos = 'Sem restrições'
            entrada_produtos = 'Sem restrições'
            recebimentos = 'Sem restrições'
            pagamentos = 'Sem restrições'
            mensagens_site = 'Sem restrições'
            conteudo_site = 'Sem restrições'
        else:
            administrador = 'NÂO'

        if index.administrador_super:
            administrador_super = 'SIM'
            administrador = 'SIM'
            usuarios = 'Sem restrições'
            colaboradores = 'Sem restrições'
            permissoes_Usuarios = 'Sem restrições'
            clientes = 'Sem restrições'
            produtos = 'Sem restrições'
            fornecedores = 'Sem restrições'
            tabela_precos = 'Sem restrições'
            vendas = 'Sem restrições'
            compras = 'Sem restrições'
            contas_pagar = 'Sem restrições'
            contas_receber = 'Sem restrições'
            saida_produtos = 'Sem restrições'
            entrada_produtos = 'Sem restrições'
            recebimentos = 'Sem restrições'
            pagamentos = 'Sem restrições'
            mensagens_site = 'Sem restrições'
            conteudo_site = 'Sem restrições'
        else:
            administrador_super = 'NÃO'

        permissoes += [{
            'descricao': index.descricao,
            'administrador_super': administrador_super,
            'administrador': administrador,
            'usuarios': usuarios,
            'permissoes_usuarios': permissoes_usuarios,
            'clientes': clientes,
            'fornecedores': fornecedores,
            'produtos': produtos,
            'tabela_precos': tabela_precos,
            'vendas': vendas,
            'compras': compras,
            'contas_pagar': contas_pagar,
            'contas_receber': contas_receber,
            'saida_produtos': saida_produtos,
            'entrada_produtos': entrada_produtos,
            'pagamentos': pagamentos,
            'recebimentos': recebimentos,
            'mensagens_site': mensagens_site,
            'conteudo_site': conteudo_site,
            'observacoes': index.observacoes,
            'status': index.status,
            'empresa': str(index.empresa),
            'id': index.id,
            'classe': classe,
            'mensagem': mensagem,
            'titulo': titulo,
        }]
    if permissoes:
        retorno = json.dumps(permissoes)
    else:
        retorno = json.dumps({
            'titulo': titulo,
            'mensagem': '''Nenhum registro de permissão de usuarios foi encontrado.
            Talvez, você não tenha permissão para acessar estes registros...
            ''',
            'info': 1,
        })
    return HttpResponse(retorno, content_type='application/json')


def buscar_permissao_usuario(request):
    usuario = Usuarios.objects.get(usuario=request.user)
    permissao = {}
    retorno = {}
    titulo = 'BUSCANADO PERMISÕES DE Usuarios...'
    id = request.GET.get('id')
    try:
        if usuario.permissoes.edita_permissoes_usuario and not usuario.permissoes.administrador and not usuario.permissoes.administrador_super:
            permissao = Permissoes.objects.get(id=int(id),
                                               administrador_super=0,
                                               administrador=0,
                                               empresa=usuario.empresa.id)
        if usuario.permissoes.administrador and usuario.permissoes.administrador and not usuario.permissoes.administrador_super:
            permissao = Permissoes.objects.get(id=int(id),
                                               empresa=usuario.empresa.id,
                                               administrador_super=0)
        if usuario.permissoes.administrador_super:
            permissao = Permissoes.objects.get(id=int(id))
    except:
        pass

    if permissao:
        form = FormPermissoesUsuarios(instance=permissao)
        mensagem = 'Busca efetuada com sucesso !!!'
        campos = {}
        for campo in form.fields:
            if campo in form.initial:
                campos[form.auto_id % campo] = unicode(form.initial[campo])

        retorno = json.dumps({
            'id': id,
            'titulo': titulo,
            'mensagem': mensagem,
            'campos': campos,
        })
    else:
        retorno = json.dumps({
            'titulo': titulo,
            'mensagem': 'Nenhum registro de permissão de colaborador corresponde ao ID informado.'
                        'Ou talvez, você não tenha permissão para acessar estes dados...',
            'info': 1,
        })

    return HttpResponse(retorno, content_type='application/json')


def status_permissoes_usuario(request):
    retorno = {}
    titulo = ''
    mensagem = ''
    try:
        usuario = Usuarios.objects.get(usuario=request.user)
        if not usuario.permissoes.muda_status_permissoes_usuario and not usuario.permissoes.administrador \
                and not usuario.permissoes.administrador_super:
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
            retorno['mensagem'] = mensagem_permissao_negada()
            return HttpResponse(json.dumps(retorno), content_type="application/json")

        elif request.method == 'POST':
            permissao = Permissoes.objects.get(id=int(QueryDict(request.body).get('permissao_id')))
            status = QueryDict(request.body).get('status')

            permissao.status = status
            permissao.save()

            if status == 'ATIVO':
                mensagem = 'Permissões ativadas com sucesso !!!'
                titulo = 'ATIVAR PERMISSÕES DE COLABORADOR...'

            elif status == 'INATIVO':
                mensagem = 'Permissões desativadas com sucesso !!!'
                titulo = 'DESATIVAR PERMISSÕES DE COLABORADOR...'

            elif status == 'EXCLUIDO':
                mensagem = 'Permissões excluidas com sucesso !!!'
                titulo = 'EXCLUIR PERMISSÕES DE COLABORADOR ...'

            retorno['mensagem'] = mensagem
            retorno['titulo'] = titulo
            retorno['sucesso'] = 1
            retorno['status'] = status
    except:
        retorno['titulo'] = titulo_mensagem_erro_padrao()
        retorno['mensagem'] = mensagem_erro_padrao()
        retorno['erro'] = 1

    return HttpResponse(
            json.dumps(retorno), content_type="application/json")
