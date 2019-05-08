$(function() {

    var status = '';
    var id_compra = 0;
    var data_compra = '';
    var fornecedor = '';
    var nota_fiscal = 0;
    var method ='';
    var id_conta = 0;
    var form = {};
    var quantidade_parcelas = 0;
    var valor_total = 0;
    var valor_parcela = 0;
    var valor_entrada = 0;
    var saldo = 0;
    var saldo_final = 0;
    var data_atual = 0;

    $('#id_valor_total').on('change', function(event){
        if ($('#id_valor_total').val() == ''){
        $('#id_valor_total').val('0.00')
        };
        $("#id_valor_total").val(parseFloat($("#id_valor_total").val()).toFixed(2));
	});

    $('#form').on('submit', function(event){
        event.preventDefault();
        abreCamposFormCompras();
        form = $('#form').serialize(true);
        fechaCamposFormCompras();
        salvar(form);
    });

    $('#buscar_compra').on('submit', function(event){
        event.preventDefault();
        id_compra = $('#id_id_compra').val();
        buscarCompra(id_compra);
    });

    $('#formPesquisaComprasFornecedor').on('submit', function(event){
        event.preventDefault();
        data_compra = '';
        status = '';
        id_compra = '';
        nota_fiscal = '';
        fornecedor = $('#id_fornecedor').val();
        removeClassMenu();
        buscarCompras(status, fornecedor, id_compra, data_compra, nota_fiscal);
    });

    $('#formPesquisaComprasData').on('submit', function(event){
        event.preventDefault();
        fornecedor = '';
        status = '';
        id_compra = '';
        data_compra = $('#compras-data').val();
        nota_fiscal = '';
        removeClassMenu();
        buscarCompras(status, fornecedor, id_compra, data_compra, nota_fiscal);
    });

    $('#formPesquisaComprasID').on('submit', function(event){
        event.preventDefault();
        fornecedor = '';
        status = '';
        data_compra = '';
        nota_fiscal = '';
        id_compra = $('#compras-id').val();
        removeClassMenu();
        buscarCompras(status, fornecedor, id_compra, data_compra, nota_fiscal);
    });

    $('#formPesquisaComprasNF').on('submit', function(event){
        event.preventDefault();
        fornecedor = '';
        status = '';
        data_compra = '';
        id_compra = 0;
        nota_fiscal = $('#compras-nf').val();
        removeClassMenu();
        buscarCompras(status, fornecedor, id_compra, data_compra, nota_fiscal);
    });

     $("#corpo").on('click', 'a[id^=mostar-itens-]', function(){
        event.preventDefault();
        fechaGuias();
        $('#li-tb-itens').addClass('active');
        $('#tb-itens').addClass('in active');
        $('#datatable_tabletools tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/media/base/img/loader.gif" alt="me"></h1></td></tr>');
        id_compra = $(this).attr('id').split('-')[2];
        buscarCompra(id_compra);
    });


    $("#compras-nova").on('click', function(){
         novaCompra();
    });

    $("#corpo").on('click', 'a[id^=lancado-]', function(){
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é mais possível mudar o státus desta compra devido o mesmo ser: '+status+'...';
            mensagemInfo(titulo,mensagem);
        }else{
            id_compra = $(this).attr('id').split('-')[1];
            status = 'LANCADO';
            mudaStatusCompra(id_compra, status)
        }
    });

    $("#corpo").on('click', 'a[id^=parcialmente-lancado-]', function(){
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é mais possível mudar o státus desta compra devido o mesmo ser: '+status+'...';
            mensagemInfo(titulo,mensagem);
        }else{
             id_compra = $(this).attr('id').split('-')[2];
             status = 'PARCIALMENTE LANCADO';
             mudaStatusCompra(id_compra, status)
         }
    });

    $("#corpo").on('click', 'a[id^=parcialmentelancado-]', function(){
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é mais possível mudar o státus desta compra devido o mesmo ser: '+status+'...';
            mensagemInfo(titulo,mensagem);
        }else{
             id_compra = $(this).attr('id').split('-')[1];
             status = 'PARCIALMENTE LANCADO';
             mudaStatusCompra(id_compra, status)
         }
    });


    $("#corpo").on('click', 'a[id^=cancelado-]', function(){
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é mais possível mudar o státus desta compra devido o mesmo ser: '+status+'...';
            mensagemInfo(titulo,mensagem);
        }else{
             id_compra = $(this).attr('id').split('-')[1];
             status = 'CANCELADO';
             mudaStatusCompra(id_compra, status)
         }
    });

    $("#corpo").on('click', 'a[id^=cancelar-]', function(){
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é mais possível mudar o státus desta compra devido o mesmo ser: '+status+'...';
            mensagemInfo(titulo,mensagem);
        }else{
             id_compra = $(this).attr('id').split('-')[1];
             status = 'CANCELADO';
             mudaStatusCompra(id_compra, status)
         }
    });

    $("#corpo").on('click', 'a[id^=buscar-compra-]', function(){
        id_compra = $(this).attr('id').split('-')[2];
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é possível editar esta compra devido seu státus ser: '+status+'...';
            mensagemInfo(titulo,mensagem);
        }else{
            buscarCompra(id_compra);
            abreCamposFormCompras();
            $("#form button").prop("disabled", true);
            $("#formPesquisa :input").prop("disabled", true);
            $("#btn_sair_compra").prop("disabled", false);
            $("#btn_cancelar_operacao_compra").prop("disabled", false);
            $("#btn_registrar_compra").prop("disabled", false);
            $("#id_fornecedor").prop("disabled", true);
            fechaGuias();
            $('#li-form-compras').addClass('in active');
            $('#form-compras').addClass('in active');
        }
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        id_compra = $('#id_Pesquisa').val();
        buscarCompra(id_compra)
    });

    $("#compras-nao-lancadas").on('click', function(){
        event.preventDefault();
        status = 'NAO LANCADO';
        buscarCompras(status);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#compras-parcialmente-lancadas").on('click', function(){
        event.preventDefault();
        status = 'PARCIALMENTE LANCADO';
        id_compra = '';
        buscarCompras(status, id_compra);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#compras-lancadas").on('click', function(){
        event.preventDefault();
        status = 'LANCADO';
        id_compra = '';
        buscarCompras(status, id_compra);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#compras-canceladas").on('click', function(){
        event.preventDefault();
        status = 'CANCELADO';
        id_compra = '';
        buscarCompras(status, id_compra);
        removeClassMenu();
        $(this).addClass('active');
    });

    function removeClassMenu(){
        $('#compras-nao-lancadas').removeClass('active');
        $('#compras-parcialmente-lancadas').removeClass('active');
        $('#compras-lancadas').removeClass('active');
        $('#compras-canceladas').removeClass('active');
        $('#pesquisa').removeClass('active');
    };

    function salvar(form) {
    $.ajax({
        url : "/compras/registrar-nova-compra/",
        type : "POST",
        data : { id : $('#id_id').val(), form : form},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error');

                for (var i=0; i< json.erro.length; i++){
                    $('#id_'+json.erro[i]).prop("disabled", false);
                    $('#id_'+json.erro[i]).focus();
                    $('#div_'+json.erro[i]).addClass('has-error');
                    $("#btn_alterar_compra").prop("disabled", false);
                }
                mensagemErroOperacao(json)
            }

            else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id').val(json.id);
                $("#form :input").prop("disabled", true);
                $("#formPesquisa :input").prop("disabled", false);
                $("#btn_nova_compra").prop("disabled", false);
                $("#btn_alterar_compra").prop("disabled", false);
                $("#btn_sair_compra").prop("disabled", false);
                $('#id_compra').append('<option value="'+json.id+'">'+json.fornecedor+'</option>');
                mensagemSucesso(json)
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};

    function mudaStatusCompra(id_compra, status) {
        $.ajax({
            url : "/compras/muda-status-compra/",
            type : "POST",
            data : { id_compra : id_compra, status : status },
            success : function(json) {
                if (json.sucesso){
                    $('#status-compra-'+id_compra).html("<span>"+json.status+"</span>");
                    $('#status-li-compra-'+id_compra).html("<span>"+json.status+"</span>");
                    $('#tb_registros_compra_linha-'+id_compra).hide();
                    itens = json.itens;
                    itensCompra(itens);
                    mensagemSucesso(json);
                }
                else if (json.erro){
                    mensagemErroOperacao(json)
                }else if (json.info){
                    mensagemInfo(json.titulo, json.mensagem)
                }
            },
            error : function(xhr,errmsg,err) {

                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };

    function buscarCompra(id_compra) {
        $.ajax({
            url : "/compras/buscar-compra/",
            type : "GET",
            data : { id : id_compra},
            success : function(json) {
                //console.log(json.campos);
                if(json.campos){
                    $('.form-group').removeClass('has-error').addClass('has-success');
                    $('#id_id').val(json.id);
                    for (var i in json.campos){
                        //$('#'+i).val('');
                        $('#'+i).val(json.campos[i]).val;
                    }
                    $("#btn_alterar_compra").prop("disabled", false);
                    //itens = json.itens;
                    itensCompra(json);
                    //$('#informativo_compra').html("<span>000"+json.id+" -"+json.fornecedor+" ( <strong>$ "+parseFloat(json.valor_total).toFixed(2)+"</strong> )</span>");
                    //$('#info_compra').html("<h6>Data: <strong> "+json.data_compra+"</strong></h6>"+
                    //"<h6>Comprador: <strong> "+json.solicitante+"</strong></h6>"+
                    //"<h6>Státus: <strong> "+json.status_compra+"</strong></h6>"+
                    //"<h2>Valor total: <strong>$ "+parseFloat(json.valor_total).toFixed(2)+"</strong></h2>");
                    //$("#form :input").prop("disabled", true);
                    //mensagemSucesso(json)
                }else if(json.alerta){
                    limpaCamposFormCompras();
                    itens = [];
                    itensCompra(itens);
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


    function buscarCompras(status, fornecedor, id_compra, data_compra, nota_fiscal){
        $('#tb_registros tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "/compras/buscar-compras/",
            type : "GET",
                data : {status:status,fornecedor:fornecedor,id_compra:id_compra,data_compra:data_compra,nota_fiscal:nota_fiscal},
            success : function(json) {
                    $('#tabela').html(
                        '<table id="tb_registros" class="table table-bordered table-hover animated fadeInDown"  style="white-space: nowrap;" width="100%">'+
                        '<thead>'+
                        '<tr style="white-space: nowrap;">'+
                            '<th data-class="expand">ID</th>'+
                            '<th data-hide="phone,tablet">Data compra</th>'+
                            '<th  data-hide="phone,tablet">Valor total</th>'+
                            '<th>Fornecedor</th>'+
                            '<th data-hide="phone,tablet">Solicitante</th>'+
                            '<th data-hide="phone,tablet">nota_fiscal</th>'+
                            '<th data-hide="phone,tablet">Státus</th>'+
                            '<th data-hide="phone,tablet">Pagamento</th>'+
                            '<th data-hide="phone,tablet">Státus pagamento</th>'+
                            '<th data-hide="phone,tablet">Empresa</th>'+
                            '<th data-hide="phone,tablet">Observações</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                '</tbody">'+
                '</table>'

                    )
                for(var i=0;json.length>i;i++){
                    $('#tb_registros').append('<tr id="tb_registros_compra_linha-'+json[i].id+'">'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].data_compra+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].valor_total+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].fornecedor+', (pedido: 000.'+json[i].id+')</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-registro-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].fornecedor+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="adicionar-produto-compra-'+json[i].id+'">ADICIONAR PRODUTO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="mostar-itens-'+json[i].id+'">MOSTRAR ÍTENS DA COMPRA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="buscar-compra-'+json[i].id+'">EDITAR COMPRA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="1-finalizar-compra-'+json[i].id+'">FINALIZAR COMPRA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="parcialmentelancado-1-'+json[i].id+'">PARCIALMENTE LANÇADO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="cancelar-'+json[i].id+'">CANCELAR COMPRA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="pagamentos-conta-'+json[i].id+'">GERENCIAR PAGAMENTOS</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].solicitante+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].nota_fiscal+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-venda-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status_compra+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-venda-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status_compra+'</li>'+
                                        '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="lancado-'+json[i].id+'">LANÇADO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="parcialmente-lancado-'+json[i].id+'">PARCIALMENTE LANCÇADO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status_compra+'" id="cancelado-'+json[i].id+'">CANCELAR COMPRA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].pagamento+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].status_pagamento+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].empresa+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].observacoes+'</td>'+
                    '</tr>'
                    )
                }
                fechaGuias();
                $('#li-tb-compras').addClass('active');
                $('#tb-compras').addClass('in active');
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

    $("#corpo").on('click', 'a[id^=pagamentos-conta-]', function(){
        status = $(this).attr('title');
        id_compra = $(this).attr('id').split('-')[2];
        if (status == 'LANCADO'){
            $.ajax({
            url : '/compras/financeiro-contas-a-pagar-buscar-pagamento/'+id_compra+'/',
            type : "GET",
            data : {verifica_permissoes : 1,},
            success : function(json) {
                if (json.permissoes){
                window.open('/compras/financeiro-contas-a-pagar-buscar-pagamento/'+id_compra+'/');
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
	    $("#form_contas_a_pagar :input").prop("disabled", true);
        fechaGuias();
        $('#li-tb-compras').addClass('active');
        $('#tb-compras').addClass('in active');
	});

	$('#btn_sair_conta').on('click', function(event){
        limpaCamposFormContas();
	    $("#form_contas_a_pagar :input").prop("disabled", true);
        fechaGuias();
        $('#li-tb-compras').addClass('active');
        $('#tb-compras').addClass('in active');
	});

     $("#corpo").on('click', 'a[id^=1-finalizar-compra-]', function(){
        status = $(this).attr('title');
        if (status == 'LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Esta compra já foi finalizada...';
            mensagemInfo(titulo,mensagem);
        }else{
            id_compra = $(this).attr('id').split('-')[3];
            method = 'GET';
            form = {};
            finalizarCompra(method, id_compra, form);
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


    $('#form_contas_a_pagar').on('submit', function(event){
        event.preventDefault();
        quantidade_parcelas = parseInt($("#id_quantidade_parcelas").val());
        if($("#id_forma_de_pagamento").val() == 'A PRAZO' && quantidade_parcelas < 1){
            mensagemAlerta('QUANTIDADE DE PARCELAS INVÁLIDO...','Informe a quantidade de parcelas...');
            $("#btn_registrar_conta").prop("disabled", true);
            $("#id_quantidade_parcelas").focus();
        }else{
            $("#id_favorecido").prop("disabled", false);
            $("#form_contas_a_pagar :input").prop("disabled", false);
            form = $('#form_contas_a_pagar').serialize(true);
            method = "POST";
            $("#id_favorecido").prop("disabled", true);
            $("#form_contas_a_pagar :input").prop("disabled", true);
            finalizarCompra(method, id_compra, form)
        }
    });

    function finalizarCompra(method, id_compra, form) {

    $.ajax({
        url : "/compras/finalizar-compra/",
        type : method,
        data : { id_conta : $('#id_id_conta').val(), form : form, id_compra : id_compra},

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
                $("#form_contas_a_pagar :input").prop("disabled", true);
                $("#btn_sair_conta").prop("disabled", false);
                 $('#id_conta').val(json.id_conta);
                mensagemSucesso(json)
            }else if(json.method == 'GET' && !json.erro){
               limpaCamposFormContas();
                $('#id_favorecido').val(json.favorecido);
                $('#id_valor_conta').val(json.valor_total);
                data_atual = json.data_atual;
                habilitaCamposFormContas();
                fechaGuias();
                $('#form-contas').addClass('in active');
                $('#li-form-contas').addClass('active');
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

function novaCompra(){
	limpaCamposFormCompras();
	desabilitarFormPesquisas();
	abreCamposFormCompras();
    desativaBotoesFormCompras();
    $("#btn_sair_compra").prop("disabled", false);
	$("#btn_registrar_compra").prop("disabled", false);
	$("#btn_cancelar_operacao_compra").prop("disabled", false);
	fechaGuias();
	$('#form-compras').addClass('in active');
    $('#li-form-compras').addClass('active');
};

function alterarCompra(){
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
        abreCamposFormCompras();
        ativaBotoesFormCompras();
        $("#form select").prop("disabled", true);
         $("#id_id").prop("disabled", true);
        $("#formPesquisa input").prop("disabled", true);
        $("#btn_nova_compra").prop("disabled", true);
        $("#btn_alterar_compra").prop("disabled", true);
	}
};

function cancelarOperacaoCompra(){
    desativaBotoesFormCompras();
    limpaCamposFormCompras();
    fechaCamposFormCompras();
	habilitarFormPesquisas();
	$("#btn_sair_compra").prop("disabled", false);
	$("#btn_nova_compra").prop("disabled", false);
};

function sairCompra(){
    cancelarOperacaoCompra();
    $('#li-tb-compras').addClass('active');
    $('#tb-compras').addClass('in active');
    $('#form-compras').removeClass('in active');
    $('#li-form-compras').removeClass('active');
    $('#li-form-entrada-produtos').removeClass('in active');
    $('#form-entrada-produtos').removeClass('in active');
};

function limpaCamposFormCompras(){
    $('#form input').val("");
	$('#form select').val("");
	$("#form textarea").val('');
	$('#form input[type=number]').val("0");
	$('.form-group').removeClass('has-error').removeClass('has-success');
};

function abreCamposFormCompras(){
   $("#form input").prop("disabled", false);
   $("#form select").prop("disabled", false);
   $("#form textarea").prop("disabled", false);
   $("#id_id").prop("disabled", true);
   $('.form-group').removeClass('has-error').removeClass('has-success');
};

function fechaCamposFormCompras(){
   $("#form input").prop("disabled", true);
   $("#form select").prop("disabled", true);
   $("#form textarea").prop("disabled", true);
   $('.form-group').removeClass('has-error').removeClass('has-success');
};

function ativaBotoesFormCompras(){
    $("#form button").prop("disabled", false);
};

function desativaBotoesFormCompras(){
    $("#form button").prop("disabled", true);

};

function habilitarFormPesquisas(){
    $("#formPesquisa input").prop("disabled", false);
};

function desabilitarFormPesquisas(){
    $("#formPesquisa input").prop("disabled", true);
};

function fechaGuias(){
    $('#li-tb-compras').removeClass('active');
    $('#tb-compras').removeClass('in active');
    $('#li-tb-itens').removeClass('active');
    $('#tb-itens').removeClass('in active');
    $('#form-compras').removeClass('in active');
    $('#li-form-compras').removeClass('active');
    $('#li-form-entrada-produtos').removeClass('in active');
    $('#form-entrada-produtos').removeClass('in active');
    $('#li-form-contas').removeClass('in active');
    $('#form-contas').removeClass('in active');
};

function habilitaCamposFormContas(){
   $("#form_contas_a_pagar :input").prop("disabled", false);
   $("#btn_alterar_conta").prop("disabled", true);
   $("#id_conta").prop("disabled", true);
   $("#id_valor_conta").prop("disabled", true);
   $("#id_favorecido").prop("disabled", true);
   $("#id_valor_parcela").prop("disabled", true);
   $("#id_valor_juros").prop("disabled", true);
   $('.form-group').removeClass('has-error').removeClass('has-success');
};

function limpaCamposFormContas(){
   $("#form_contas_a_pagar :input").val('');
   $("#id_conta").val('0');
   $("#id_valor_conta").val('0.00');
   $("#id_favorecido").val('');
   $("#id_valor_parcela").val('0.00');
   $("#id_valor_juros").val('0.00');
   $("#id_valor_entrada").val('0.00');
   $("#id_quantidade_parcelas").val('0');
   $("#id_valor_juros").val('0.00');
   $('.form-group').removeClass('has-error').removeClass('has-success');
};