$(function() {

    var status, titulo, mensagem = '';
    var id_venda = 0;
    var data_venda = '';
    var cliente = '';
    var quantidade_parcelas = 0;
    var id_conta = 0;
    var method ='';
    var form = {};
    var quantidade_parcelas = 0;
    var valor_total = 0;
    var valor_parcela = 0;
    var valor_entrada = 0;
    var saldo = 0;
    var saldo_final = 0;
    var data_atual = 0;


        document.getElementById('imprimir-cupom').onclick = function() {
            var conteudo = document.getElementById('cupom-nao-fiscal').innerHTML,
                tela_impressao = window.open();

            tela_impressao.document.write(conteudo);
            tela_impressao.window.print();
            tela_impressao.window.close();
        };


    $('#form').on('submit', function(event){
        event.preventDefault();
        var form = $('#form').serialize(true);
        salvar(form);
    });

    $('#formPesquisaVendasCliente').on('submit', function(event){
        event.preventDefault();
        data_venda = '';
        status = '';
        id_venda = '';
        cliente = $('#vendas-cliente').val();
        removeClassMenu();
        buscarVendas(status, cliente, id_venda, data_venda);
    });

    $('#formPesquisaVendasData').on('submit', function(event){
        event.preventDefault();
        cliente = '';
        status = '';
        id_venda = '';
        data_venda = $('#vendas-data').val();
        removeClassMenu();
        buscarVendas(status, cliente, id_venda, data_venda);
    });

    $('#formPesquisaVendasID').on('submit', function(event){
        event.preventDefault();
        cliente = '';
        status = '';
        data_venda = '';
        id_venda = $('#vendas-id').val();
        removeClassMenu();
        buscarVendas(status, cliente, id_venda, data_venda);
    });

     $("#corpo").on('click', 'a[id^=mostar-itens-]', function(){
        event.preventDefault();
        $('#tb_itens tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/media/base/img/loader.gif" alt="me"></h1></td></tr>');
        id_venda = $(this).attr('id').split('-')[2];
        $('#tb_itens tbody').remove();
        buscarVenda(id_venda);
        fechaGuias();
        $('#li-tb-itens').addClass('active');
        $('#tb-itens').addClass('in active');
    });


    $("#vendas-nova").on('click', function(){
         novaVenda();
    });

    $("#corpo").on('click', 'a[id^=concluido1-entregue-]', function(){
        status = $(this).attr('title');
        if (status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda está cancelada...');
        }else if(status == 'EM ANDAMENTO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Antes de marcar um pedido como entregue, a venda deve ser finalizada...');
        }else if(status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta venda já foi finalizada...');
        }else if(status == 'CONCLUIDO NAO ENTREGUE'){
         id_venda = $(this).attr('id').split('-')[2];
         status = 'CONCLUIDO E ENTREGUE';
         mudaStatusVenda(id_venda, status);
         }else{
         mensagemErroSistema();
         }
    });

    $("#corpo").on('click', 'a[id^=concluido-entregue-]', function(){
        status = $(this).attr('title');
        if (status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda está cancelada...');
        }else if(status == 'EM ANDAMENTO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Antes de marcar um pedido como entregue, a venda deve ser finalizada...');
        }else if(status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta venda já foi finalizada...');
        }else if(status == 'CONCLUIDO NAO ENTREGUE'){
         id_venda = $(this).attr('id').split('-')[2];
         status = 'CONCLUIDO E ENTREGUE';
         mudaStatusVenda(id_venda, status);
         }else{
         mensagemErroSistema();
         }
    });

    $("#corpo").on('click', 'a[id^=concluido1-nao-entregue-]', function(){
         status = $(this).attr('title');
        if (status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda está cancelada...');
        }else if(status == 'EM ANDAMENTO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Antes de marcar um pedido não entregue, a venda deve ser finalizada...');
        }else if(status == 'CONCLUIDO NAO ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta venda já possui este státus...');
        }else if(status == 'CONCLUIDO E ENTREGUE'){
         id_venda = $(this).attr('id').split('-')[3];
         status = 'CONCLUIDO NAO ENTREGUE';
         mudaStatusVenda(id_venda, status);
         }else{
         mensagemErroSistema();
         }
    });

    $("#corpo").on('click', 'a[id^=concluido-nao-entregue-]', function(){
         status = $(this).attr('title');
        if (status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda está cancelada...');
        }else if(status == 'EM ANDAMENTO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Antes de marcar um pedido não entregue, a venda deve ser finalizada...');
        }else if(status == 'CONCLUIDO NAO ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta venda já possui este státus...');
        }else if(status == 'CONCLUIDO E ENTREGUE'){
         id_venda = $(this).attr('id').split('-')[3];
         status = 'CONCLUIDO NAO ENTREGUE';
         mudaStatusVenda(id_venda, status);
         }else{
         mensagemErroSistema();
         }
    });

    $("#corpo").on('click', 'a[id^=cancelar-pedido-]', function(){
         status = $(this).attr('title');
        if (status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda já está cancelada...');
        }else if(status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta venda já foi entregue, por isto não pode ser cancelada...');
        }else if(status == 'CONCLUIDO NAO ENTREGUE' || status == 'EM ANDAMENTO'){
            id_venda = $(this).attr('id').split('-')[2];
            status = 'CANCELADO';
				$.SmartMessageBox({
					title : "ALERTA!!!",
					content : "TER CERTEZA QUE DESEJA CANCELAR ESTA VENDA???<br>Lembramos que, não será possível reverter o processo de cancelamento...",
					buttons : '[SIM][NÃO]'
				}, function(ButtonPressed) {
					if (ButtonPressed === "SIM") {
				        mudaStatusVenda(id_venda, status);
					}
					if (ButtonPressed === "NÃO") {
						mensagemInfo('AÇÃO INTERROMPIDA...', 'A ação foi interrompida com sucesso, a venda não foi cancelada...')
					}
				});

         }else{
         mensagemErroSistema();
         }
    });


    $("#corpo").on('click', 'a[id^=cancelar1-pedido-]', function(){
         status = $(this).attr('title');
        if (status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda já está cancelada...');
        }else if(status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta venda já foi entregue, por isto não pode ser cancelada...');
        }else if(status == 'CONCLUIDO NAO ENTREGUE' || status == 'EM ANDAMENTO'){
            id_venda = $(this).attr('id').split('-')[2];
            status = 'CANCELADO';
				$.SmartMessageBox({
					title : "ALERTA!!!",
					content : "TER CERTEZA QUE DESEJA CANCELAR ESTA VENDA???<br>Lembramos que, não será possível reverter o processo de cancelamento...",
					buttons : '[SIM][NÃO]'
				}, function(ButtonPressed) {
					if (ButtonPressed === "SIM") {
				        mudaStatusVenda(id_venda, status);
					}
					if (ButtonPressed === "NÃO") {
						mensagemInfo('AÇÃO INTERROMPIDA...', 'A ação foi interrompida com sucesso, a venda não foi cancelada...')
					}
				});

         }else{
         mensagemErroSistema();
         }
    });


    $("#corpo").on('click', 'a[id^=buscar-venda-]', function(){
        status = $(this).attr('title');
        id_venda = $(this).attr('id').split('-')[2];
        if (status == 'CANCELADO' || status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','A ação não pode ser concluída, pois esta venda já foi finalizada...');
        }else{
            buscarVenda(id_venda);
            fechaGuias();
            $('#form-vendas').addClass('in active');
            $('#li-form-vendas').addClass('active');
        }
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        id_venda = $('#id_Pesquisa').val();
        buscarVenda(id_venda)
    });

    $("#vendas-em-andamento").on('click', function(){
        event.preventDefault();
        status = 'EM ANDAMENTO';
        id_venda = '';
        buscarVendas(status, id_venda);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#vendas-concluidas-entregues").on('click', function(){
        event.preventDefault();
        status = 'CONCLUIDO E ENTREGUE';
        id_venda = '';
        buscarVendas(status, id_venda);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#vendas-concluidas-nao-entregues").on('click', function(){
        event.preventDefault();
        status = 'CONCLUIDO NAO ENTREGUE';
        id_venda = '';
        buscarVendas(status, id_venda);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#vendas-canceladas").on('click', function(){
        event.preventDefault();
        status = 'CANCELADO';
        id_venda = '';
        buscarVendas(status, id_venda);
        removeClassMenu();
        $(this).addClass('active');
    });

    function removeClassMenu(){
        $('#vendas-em-andamento').removeClass('active');
        $('#vendas-concluidas-nao-entregues').removeClass('active');
        $('#vendas-concluidas-entregues').removeClass('active');
        $('#vendas-canceladas').removeClass('active');
        $('#pesquisa').removeClass('active');
    };

    function salvar(form) {
    $.ajax({
        url : "/vendas/registrar-nova-venda/",
        type : "POST",
        data : { id : $('#id_id').val(), form : form},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error').addClass('has-success');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json)
            }

            else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id').val(json.id);
                $("#form :input").prop("disabled", true);
                $("#formPesquisa :input").prop("disabled", false);
                $("#btn_nova_venda").prop("disabled", false);
                $("#btn_alterar_venda").prop("disabled", false);
                $("#btn_sair_venda").prop("disabled", false);
                $('#id_venda').append('<option value="'+json.id+'">'+json.cliente+'</option>');
                limpaCamposFormSaida();
                $("#id_venda").val(json.id);
            if (parseInt($("#id_venda").val()) > 0){
                    $("#id_codigo_barras").prop("disabled", false);
                    $("#id_produto").prop("disabled", false);
                    $("#id_id_produto").prop("disabled", false);
                    $("#id_observacoes_saida").prop("disabled", false);
                    $("#id_produtos_tabelados").prop("disabled", false);
                    fechaGuias();
                    $('#form-saida-produtos').addClass('in active');
                    $('#li-form-saida-produtos').addClass('active');
                    $('#id_produtos_tabelados').empty().append('<option value=""></option>');
                    for(var i=0;json.tabela.length>i;i++){
                        $('#id_produtos_tabelados').append('<option value="'+json.tabela[i].id_produto+'">'+json.tabela[i].produto+'</option>')
                        }
                }

                mensagemSucesso(json)
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};

    function mudaStatusVenda(id_venda, status) {
        $.ajax({
            url : "/vendas/muda-status-venda/",
            type : "POST",
            data : { id_venda : id_venda, status : status },

            success : function(json) {
                if (json.sucesso){
                    $('#status-venda-'+id_venda).html("<span>"+json.status+"</span>");
                    $('#status-li-venda-'+id_venda).html("<span>"+json.status+"</span>");
                    if(status == 'CANCELADO'){
                    $('#linha-'+id_venda).hide();
                    }
                    buscarVenda(id_venda);
                    mensagemSucesso(json);
                }
                else if (json.erro){
                    mensagemErroOperacao(json)
                }
            },

            error : function(xhr,errmsg,err) {

                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };


    function buscarVenda(id_venda) {
        $.ajax({
            url : "buscar-venda/",
            type : "GET",
            data : { id : id_venda},
            success : function(json) {
                if(json.campos){
                   $('.form-group').removeClass('has-error').addClass('has-success');
                   $('#id_id').val(json.id);
                   $("#form :input").prop("disabled", true);
                    for (var i in json.campos) {
                        //$('#'+i).val('');
                        $('#'+i).val(json.campos[i]).val;
                    }
                    if (json.status_pedido == 'CONCLUIDO E ENTREGUE' || json.status_pedido != 'CANCELADO'){
                       $("#btn_alterar_venda").prop("disabled", false);
                       $("#btn_sair_venda").prop("disabled", false);
                       $("#btn_alterar_venda").prop("disabled", false);
                       $("#btn_nova_venda").prop("disabled", false);
                    }
                    itensVenda(json);
                    //$("#form :input").prop("disabled", true);
                    //mensagemSucesso(json)
                }else if(json.alerta){
                    limpaCamposFormVendas();
                    itensVenda(json);
                    titulo = json.titulo;
                    mensagem = json.mensagem;
                    mensagemAlerta(titulo, mensagem);
                }
            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };


    function buscarVendas(status, cliente, id_venda, data_venda) {
        $.ajax({
            url : "buscar-vendas/",
            type : "GET",
                data : { status : status, cliente : cliente, id_venda: id_venda, data_venda : data_venda },
            success : function(json) {
                    $('#tabela').html(
                    '<table id="tb_registros" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                    '<tr style="white-space: nowrap;">'+
                        '<th data-class="expand">ID</th>'+
                        '<th data-hide="">Cliente</th>'+
                        '<th>Valor bruto</th>'+
                        '<th>Desconto</th>'+
                        '<th>Valor liquido</th>'+
                        '<th data-hide="phone">Solicitante</th>'+
                        '<th data-hide="phone,tablet">Data venda</th>'+
                        '<th data-hide="phone,tablet">Data entrega</th>'+
                        '<th data-hide="phone,tablet">Data vencimento</th>'+
                        '<th data-hide="phone,tablet">Státus pedido</th>'+
                        '<th data-hide="phone,tablet">Státus pagamento</th>'+
                        '<th data-hide="phone,tablet">ID pagamento</th>'+
                        '<th data-hide="phone,tablet">Empresa</th>'+
                        '<th data-hide="phone,tablet">Observações</th>'+
                        '<th data-hide="phone,tablet">Endereço de entrega</th>'+
                        '<th data-hide="phone,tablet">Oservações entrega</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody style="white-space: nowrap;">'+
                '</tbody">'+
                '</table>'

                    )
                for(var i=0;json.length>i;i++){
                    $('#tb_registros').append('<tr id="linha-'+json[i].id+'">'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].cliente+', (pedido: 000.'+json[i].id+')</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-registro-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].cliente+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="adicionar-produto-venda-'+json[i].id+'">ADICIONAR PRODUTO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="mostar-itens-'+json[i].id+'">MOSTRAR ÍTENS DO PEDIDO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="buscar-venda-'+json[i].id+'">ALTERAR PEDIDO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="finalizar-venda-'+json[i].id+'">FINALIZAR VENDA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="imprimir-pedido-pdf-'+json[i].id+'">IMPRIMIR PEDIDO EM PDF</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="imprimir-pedido-'+json[i].id+'-1">IMPRIMIR CUPOM 1 VIA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="imprimir-pedido-'+json[i].id+'-2">IMPRIMIR CUPOM 2 VIAS</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="concluido1-entregue-'+json[i].id+'">MARCAR COMO ENTREGUE</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="concluido1-nao-entregue-'+json[i].id+'">MARCAR COMO NÃO ENTREGUE</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="cancelar-pedido-'+json[i].id+'">CANCELAR PEDIDO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="pagamentos-conta-'+json[i].id+'">GERENCIAR PAGAMENTOS</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].valor_total+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].desconto+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].saldo_final+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].solicitante+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].data_venda+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].data_entrega+'</td>'+
                     '<td class="'+json[i].classe+'">'+json[i].vencimento+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-venda-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status_pedido+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-venda-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status_pedido+'</li>'+
                                        '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="concluido-entregue-'+json[i].id+'">MARCAR COMO ENTREGUE</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="concluido-nao-entregue-'+json[i].id+'">MARCAR COMO NÃO ENTREGUE</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+json[i].status_pedido+'" id="cancelar1-pedido-'+json[i].id+'">CANCELAR PEDIDO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].status_pagamento+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].pagamento+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].empresa+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].observacoes+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].endereco+', '+json[i].numero+', '+json[i].bairro+', '+json[i].cidade+'|'+json[i].estado+'.</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].observacoes_entrega+'</td>'+
                    '</tr>'
                    )
                }
                fechaGuias();
                $('#li-tb-vendas').addClass('active');
                $('#tb-vendas').addClass('in active');
                pageSetUp();

                var responsiveHelper_tb_registros = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

                /* COLUMN SHOW - HIDE */
			$('#tb_registros').dataTable({
				"sDom": "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-6 hidden-xs'C>r>"+
						"t"+
						"<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-sm-6 col-xs-12'p>>",
				"autoWidth" : true,
				"scrollX": true,
                //"scrollY":"400px",
                scrollY:        '50vh',
                //"scrollCollapse": true,
                //"paging": false,
                "stateSave": true,
				"oLanguage": {
					"sSearch": '<span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>'
				},
				"preDrawCallback" : function() {
					// Initialize the responsive datatables helper once.
					if (!responsiveHelper_tb_registros) {
						responsiveHelper_tb_registros = new ResponsiveDatatablesHelper($('#tb_registros'), breakpointDefinition);
					}
				},
				"rowCallback" : function(nRow) {
					responsiveHelper_tb_registros.createExpandIcon(nRow);
				},
				"drawCallback" : function(oSettings) {
					responsiveHelper_tb_registros.respond();
				}
			});

			/* END COLUMN SHOW - HIDE */

            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    };

    $("#corpo").on('click', 'a[id^=imprimir-pedido-]', function(){

        status = $(this).attr('title');
        id_venda = $(this).attr('id').split('-')[2];
        var vias = $(this).attr('id').split('-')[3];
        if (status == 'CONCLUIDO NAO ENTREGUE'){
            $.ajax({
            url : '/vendas/imprimir-cupom-nao-fiscal/'+id_venda+'/',
            type : "GET",
            data : {verifica_permissoes : 1,},
            success : function(json) {
                if (json.permissoes){
                    $('#cupom-nao-fiscal').load('/vendas/imprimir-cupom-nao-fiscal/'+id_venda+'/?vias=' + vias);
                    $("#modal-cupom-nao-fiscal").modal();
                }else if(json.erro){
                mensagemErroOperacao(json)
                }else if(json.info){
                mensagemInfo(json.titulo, json.mensagem)
                }else if(json.deslogar_usuario){
                location.reload();
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
        }else if(status == 'EM ANDAMENTO' || status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Somente é possível imprimir pedidos que já estejam concluídos. Os mesmos não podem ter sido ainda entregues e nem cancelados...');
        }else if(status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Não há pagamentos referente a esta venda, pois a mesma foi cancelada...');
        }
    });

    $("#corpo").on('click', 'a[id^=imprimir-pedido-pdf-]', function(){
        status = $(this).attr('title');
        id_venda = $(this).attr('id').split('-')[3];
        if (status == 'CONCLUIDO NAO ENTREGUE'){
            $.ajax({
            url : '/vendas/imprimir-cupom-nao-fiscal/'+id_venda+'/',
            type : "GET",
            data : {verifica_permissoes : 1,},
            success : function(json) {
                if (json.permissoes){
                window.open('/vendas/imprimir-pedido-pdf/'+id_venda+'/');
                }else if(json.erro){
                mensagemErroOperacao(json)
                }else if(json.info){
                mensagemInfo(json.titulo, json.mensagem)
                }else if(json.deslogar_usuario){
                location.reload();
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
        }else if(status == 'EM ANDAMENTO' || status == 'CONCLUIDO E ENTREGUE'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Somente é possível imprimir pedidos que já estejam concluídos. Os mesmos não podem ter sido ainda entregues e nem cancelados...');
        }else if(status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Não há pagamentos referente a esta venda, pois a mesma foi cancelada...');
        }
    });

    $("#corpo").on('click', 'a[id^=pagamentos-conta-]', function(){
        status = $(this).attr('title');
        id_venda = $(this).attr('id').split('-')[2];
        if (status == 'CONCLUIDO NAO ENTREGUE' || status == 'CONCLUIDO E ENTREGUE'){
            $.ajax({
            url : '/vendas/financeiro-contas-a-receber-buscar-pagamento/'+id_venda+'/',
            type : "GET",
            data : {verifica_permissoes : 1,},
            success : function(json) {
                if (json.permissoes){
                window.open('/vendas/financeiro-contas-a-receber-buscar-pagamento/'+id_venda+'/');
                }else if(json.erro){
                mensagemErroOperacao(json)
                }else if(json.info){
                mensagemInfo(json.titulo, json.mensagem)
                }else if(json.deslogar_usuario){
                location.reload();
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });

        }else if(status == 'PARCIALMENTE LANCADO' || status == 'NAO LANCADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Não há pagamentos referente a esta compra, pois a mesma ainda não foi finalizada...');
        }else if(status == 'CANCELADO'){
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Não há pagamentos referente a esta compra, pois a mesma foi cancelada...');
        }
    });



     $('#btn_cancelar_conta').on('click', function(event){
        limpaCamposFormContas();
	    $("#form_contas_a_receber :input").prop("disabled", true);
        fechaGuias();
        $('#li-tb-vendas').addClass('active');
        $('#tb-vendas').addClass('in active');
	});

	$('#btn_sair_conta').on('click', function(event){
        limpaCamposFormContas();
	    $("#form_contas_a_receber :input").prop("disabled", true);
        fechaGuias();
        $('#li-tb-vendas').addClass('active');
        $('#tb-vendas').addClass('in active');
	});

     $("#corpo").on('click', 'a[id^=finalizar-venda-]', function(){
        status = $(this).attr('title');
        if (status != 'EM ANDAMENTO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Esta VENDA já foi finalizada...';
            mensagemInfo(titulo,mensagem);
        }else{
            id_venda = $(this).attr('id').split('-')[2];
            method = 'GET';
            form = {};
            finalizarVenda(method, id_venda, form);
        }
    });

    $('#id_quantidade_parcelas').on('change', function(event){
	    $("#btn_registrar_conta").prop("disabled", true);
		if($("#id_quantidade_parcelas").val() != ''){
		    quantidade_parcelas = parseInt($(event.target).val());
		}else{
            titulo = 'QUANTIDADE DE PARCELAS INVÁLIDO...'
            mensagem = 'Você está vendo esta menságem, porque deixou o campo parcelas em branco, ou o sistema rejeitou '+
            'a virgula na separação de casas decimais. Informe informe a quantidade de parcelas sem usar virgulas...';
            $("#id_quantidade_parcelas").val('1');
            $("#id_quantidade_parcelas").focus();
            mensagemAlerta(titulo, mensagem);
        }
		efetuarCalculo();
	});

	$('#id_valor_entrada').on('change', function(event){
	    if($("#id_forma_de_pagamento").val() == 'A VISTA' && parseFloat($("#id_valor_entrada").val()) > 0){
            mensagemAlerta('ENTRADA NÃO ECEITA...','Para pagamentos á vista a entrada deve ser sempre $0,00...');
            $("#id_valor_entrada").val('0.00');
        }else{
            $("#btn_registrar_conta").prop("disabled", true);
            if($("#id_valor_entrada").val() != ''){
		        quantidade_parcelas = parseFloat($(event.target).val());
		    }else{
                titulo = 'VALOR ENTRADA INVÁLIDO...'
                mensagem = 'Você está vendo esta menságem, porque deixou o campo entrada em branco, ou o sistema rejeitou '+
                'a virgula na separação de casas decimais. Informe informe o valor da entrada trocando a virgula por um ponto ...';
                $("#id_valor_entrada").val('0.00');
                $("#id_valor_entrada").focus();
                mensagemAlerta(titulo, mensagem);
            }
        }
        efetuarCalculo();
	});

	$('#id_forma_de_pagamento').on('change', function(event){
	    event.preventDefault();
	    if($("#id_forma_de_pagamento").val() == 'A VISTA'){
            $("#id_valor_entrada").val('0.00');
            $("#id_quantidade_parcelas").val('0');
            $("#id_valor_entrada").prop("disabled", true);
            $("#id_quantidade_parcelas").prop("disabled", true);
            $("#id_primeiro_vencimento").prop("disabled", true);
            $("#id_primeiro_vencimento").val(data_atual);
            }else{
                $("#id_primeiro_vencimento").val('');
                $("#id_valor_entrada").prop("disabled", false);
                $("#id_quantidade_parcelas").prop("disabled", false)
                $("#id_primeiro_vencimento").prop("disabled", false);;
            }
            efetuarCalculo();
	});

    function efetuarCalculo(){
        valor_total = parseFloat($("#id_valor_conta").val());
         quantidade_parcelas = parseInt($("#id_quantidade_parcelas").val());
        if($("#id_forma_de_pagamento").val() == 'A PRAZO' && quantidade_parcelas < 1){
            //mensagemAlerta('QUANTIDADE DE PARCELAS INVÁLIDO...','Informe a quantidade de parcelas...');
            $("#btn_registrar_conta").prop("disabled", true);
            $("#id_quantidade_parcelas").focus();
        }else{
        if (valor_total > 0){
            if (quantidade_parcelas==0){quantidade_parcelas = 1};
            valor_entrada = parseFloat($("#id_valor_entrada").val());
            saldo = (valor_total - valor_entrada);
            valor_parcela = (saldo / quantidade_parcelas)
            saldo_final = (valor_parcela * quantidade_parcelas) + valor_entrada
            $("#id_valor_parcela").val(parseFloat(valor_parcela).toFixed(2));
            if($("#id_forma_de_pagamento").val() == 'A VISTA'){$("#id_valor_parcela").val('0.00');}
            if(saldo_final == valor_total){
                $("#btn_registrar_conta").prop("disabled", false);
            }else{
                mensagemAlerta('IDENTIFICADO QUEBAS OU SOBRAS...','O saldo final apresentou diferença de $'+saldo_final-valor_total+'. Tente resolver isto, arredondando o valor da entrada...');
                $("#btn_registrar_conta").prop("disabled", true);
            }
        }else{
            mensagemAlerta('IMPOSSÍVEL EFETUAR CÁLCULO...','Não foi possível efetuar o cálculo, pois o valor total da compra é $0,00...');
            $("#btn_registrar_conta").prop("disabled", true);
        }
        }
    };


    $('#form_contas_a_receber').on('submit', function(event){
        event.preventDefault();
        quantidade_parcelas = parseInt($("#id_quantidade_parcelas").val());
        if($("#id_forma_de_pagamento").val() == 'A PRAZO' && quantidade_parcelas < 1){
            mensagemAlerta('QUANTIDADE DE PARCELAS INVÁLIDO...','Informe a quantidade de parcelas...');
            $("#btn_registrar_conta").prop("disabled", true);
            $("#id_quantidade_parcelas").focus();
        }else{
            $("#form_contas_a_receber :input").prop("disabled", false);
            form = $('#form_contas_a_receber').serialize(true);
            method = "POST";
            $("#form_contas_a_receber :input").prop("disabled", true);
            finalizarVenda(method, id_venda, form)
        }
    });

    function finalizarVenda(method, id_venda, form) {
    $.ajax({
        url : "/vendas/finalizar-venda/",
        type : method,
        data : { id_conta : $('#id_id_conta').val(), form : form, id_venda : id_venda},

        success : function(json) {
            if (json.form_erro){
                $('.form-group').removeClass('has-error').addClass('has-success');
                for (var i=0; i< json.form_erro.length; i++){
                    $('#div_'+json.form_erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json)
            }
            else if(json.sucesso){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $("#form_contas_a_receber :input").prop("disabled", true);
                $("#btn_sair_conta").prop("disabled", false);
                $('#id_conta').val(json.id_conta);
                buscarVenda(id_venda);
                mensagemSucesso(json)
            }else if(json.method == 'GET' && !json.erro){
               limpaCamposFormContas();
                $('#id_agente_pagador').val(json.agente_pagador);
                $('#id_valor_conta').val(json.valor_total);
                data_atual = json.data_atual;
                habilitaCamposFormContas();
                fechaGuias();
                $('#form-contas').addClass('in active');
                //$('#li-form-contas').addClass('active');
            }else if(json.erro){
            mensagemErroOperacao(json);
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
        });
    };

});

function novaVenda(){
	limpaCamposFormVendas();
	desabilitarFormPesquisas();
	abreCamposFormVendas();
    desativaBotoesFormVendas();
    $("#btn_sair_venda").prop("disabled", false);
	$("#btn_registrar_venda").prop("disabled", false);
	$("#btn_cancelar_operacao_venda").prop("disabled", false);
	fechaGuias();
	$('#form-vendas').addClass('in active');
    $('#li-form-vendas').addClass('active');
};

function alterarVenda(){
	var id = $('#id_id').val();
	if (id == '0') {
	$.smallBox({
        title : "<i>EDITAR REGISTRO...</i>",
        content : "<i class='fa fa-clock-o'></i> <i>Antes, você deve fazer a busca do registro que deseja editar. . .</i>",
        color : "#5384AF",
        iconSmall : "fa fa-thumbs-up bounce animated",
        timeout : 5000
	});
    }else {
        $("#form :input").prop("disabled", false);
        $("#formPesquisa :input").prop("disabled", true);
        $("#id_id").prop("disabled", true);
        $("#id_cliente").prop("disabled", true);
        $("#btn_alterar_venda").prop("disabled", true);
        $("#btn_nova_venda").prop("disabled", true);
	}
};

function cancelarOperacaoVenda(){
    desativaBotoesFormVendas();
    limpaCamposFormVendas();
    fechaCamposFormVendas();
	habilitarFormPesquisas();
	$("#btn_sair_venda").prop("disabled", false);
	$("#btn_nova_venda").prop("disabled", false);
};

function sairVenda(){
    cancelarOperacaoVenda();
    $('#li-tb-vendas').addClass('active');
    $('#tb-vendas').addClass('in active');
    $('#form-vendas').removeClass('in active');
    $('#li-form-vendas').removeClass('active');
    $('#li-form-saida-produtos').removeClass('in active');
    $('#form-saida-produtos').removeClass('in active');
};

function limpaCamposFormVendas(){
    $('#form input').val("");
	$('#form select').val("");
	$("#form textarea").val('');
	$('#form input[type=number]').val("0");
	$('.form-group').removeClass('has-error').removeClass('has-success');
};

function abreCamposFormVendas(){
   $("#form input").prop("disabled", false);
   $("#form select").prop("disabled", false);
   $("#form textarea").prop("disabled", false);
   $("#id_id").prop("disabled", true);
   $('.form-group').removeClass('has-error').removeClass('has-success');
};

function fechaCamposFormVendas(){
   $("#form input").prop("disabled", true);
   $("#form select").prop("disabled", true);
   $("#form textarea").prop("disabled", true);
   $('.form-group').removeClass('has-error').removeClass('has-success');
};

function ativaBotoesFormVendas(){
    $("#form button").prop("disabled", false);
};

function desativaBotoesFormVendas(){
    $("#form button").prop("disabled", true);
    $("#btn_sair_vendas").prop("disabled", false);
};

function habilitarFormPesquisas(){
    $("#formPesquisa input").prop("disabled", false);
};

function desabilitarFormPesquisas(){
    $("#formPesquisa input").prop("disabled", true);
};

function fechaGuias(){
    $('#li-tb-vendas').removeClass('active');
    $('#tb-vendas').removeClass('in active');
    $('#li-tb-itens').removeClass('active');
    $('#tb-itens').removeClass('in active');
    $('#form-vendas').removeClass('in active');
    $('#li-form-vendas').removeClass('active');
    $('#li-form-saida-produtos').removeClass('in active');
    $('#form-saida-produtos').removeClass('in active');
    //$('#li-form-contas').removeClass('in active');
    $('#form-contas').removeClass('in active');
};


function habilitaCamposFormContas(){
   $("#form_contas_a_receber :input").prop("disabled", false);
   $("#btn_alterar_conta").prop("disabled", true);
   $("#id_conta").prop("disabled", true);
   $("#id_valor_conta").prop("disabled", true);
   $("#id_agente_pagador").prop("disabled", true);
   $("#id_valor_parcela").prop("disabled", true);
   $("#id_valor_juros").prop("disabled", true);
   $('.form-group').removeClass('has-error').removeClass('has-success');
};

function limpaCamposFormContas(){
   $("#form_contas_a_receber :input").val('');
   $("#id_conta").val('0');
   $("#id_valor_conta").val('0.00');
   $("#id_agente_pagador").val('');
   $("#id_valor_parcela").val('0.00');
   $("#id_valor_juros").val('0.00');
   $("#id_valor_entrada").val('0.00');
   $("#id_quantidade_parcelas").val('0');
   $("#id_valor_juros").val('0.00');
   $('.form-group').removeClass('has-error').removeClass('has-success');
};