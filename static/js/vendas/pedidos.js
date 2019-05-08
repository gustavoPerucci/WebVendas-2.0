var estoque_total = 0;
var em_estoque = 0;
var id_produto = 0;
var preco_venda = 0;
var saldo_final = 0;
var entrada_automatica = 0;
var id_saida = 0;
var quantidade_anterior = 0;
var saida_automatica = 0;
var estoque_atual = 0;
var id_embalagem_fechada = 0;
var quantidade_embalagem_fechada = 0;
var estoque_embalagem_fechada = 0;
var valor_unitario = 0;
var desconto_maximo = 0;
var desconto = 0;
var valor_desconto = 0;
var valor_total = 0;
var novo_estoque = 0;
var contagem = 0;
var quantidade_baixa = 0
var titulo, mensagem = '';
var codigo_barras = '';
var fracionar_produto = '';
var unidade_medida = '';
var x = 0;
var itens = [];
var atacado_apartir = 0;
var atacado_desconto = 0
var preco_promocional = 0;

$(function() {

    $('#id_quantidade').on('click', function(event){
        if ($('#id_quantidade').val() < 0.001){
        $('#id_quantidade').val("");
        }
	});

	$('#id_percentual_desconto').on('click', function(event){
        if ($('#id_percentual_desconto').val() < 0.001){
        $('#id_percentual_desconto').val("");
        }
	});

	$('#id_id_produto').on('click', function(event){
        $('#id_id_produto').val("");
	});

	$('#id_id_produto').on('blur', function(event){
        if ($('#id_id_produto').val() == ''){
        $('#id_id_produto').val('0')
        };
	});

	$('#btn_sair_pedido').on('click', function(event){
        $("#form_saida :input").prop("disabled", true);
        $("#btn_sair_pedido").prop("disabled", false);
        $("#imprimir-cupom").prop("disabled", false);
        $('#id_venda').val('');
        limpaCamposFormSaida();
        fechaGuias();
        $('#li-tb-vendas').addClass('active');
        $('#tb-vendas').addClass('in active');
	});

	$('#btn_alterar_pedido').on('click', function(event){
	    if (parseInt($('#id_id_saida').val() < 1)){
	        $("#btn_alterar_pedido").prop("disabled", true);
	        titulo = 'REGISTRO NÃO IDENTIFICADO...';
	        mensagem = 'O sistema não identificou o ítem que você deseja alterar...' ;
	        mensagemAlerta(titulo,mensagem);
	    }else{
	    $("#id_quantidade").prop("disabled", false);
        $("#id_quantidade").focus();
        $("#id_percentual_desconto").prop("disabled", false);
        $("#btn_alterar_pedido").prop("disabled", true);
	    }
	});

	$('#btn_cancelar_pedido').on('click', function(event){
        limpaCamposFormSaida();
        $("#id_produto").prop("disabled", false);
        $("#id_id_produto").prop("disabled", false);
        $("#id_produtos_tabelados").prop("disabled", false);
        $("#id_codigo_barras").prop("disabled", false);
        $('#id_codigo_barras').focus();
        $("#btn_cancelar_pedido").prop("disabled", true);
        $("#btn_registrar_saida").prop("disabled", true);
        $("#btn_percentual_desconto").prop("disabled", true);
        $("#id_quantidade").prop("disabled", true);

	});

	$('#btn_novo_item').on('click', function(event){
        limpaCamposFormSaida();
        if ($("#id_venda").val() != ''){
        $("#id_produto").prop("disabled", false);
        $("#id_id_produto").prop("disabled", false);
        $("#id_codigo_barras").prop("disabled", false);
        $("#id_observacoes_saida").prop("disabled", false);
        $("#id_produtos_tabelados").prop("disabled", false);
        $('#id_codigo_barras').focus();
        $("#btn_cancelar_pedido").prop("disabled", true);
        $("#btn_alterar_pedido").prop("disabled", true);
        $("#btn_registrar_saida").prop("disabled", true);
        $("#btn_novo_pedido").prop("disabled", true);
        }else{
        fechaGuias();
        $('#li-tb-vendas').addClass('active');
        $('#tb-vendas').addClass('in active');
        titulo = 'SELECIONE UMA VENDA...';
        mensagem = 'Para adicionar um produto ao pedido, você deve escolher esta opção clicando em uma venda que esteja em andamento...'
        mensagemInfo(titulo,mensagem);
        }

	});

    $('#form_saida').on('submit', function(event){
        event.preventDefault();
        $("#form_saida :input").prop("disabled", false);
        var form_saida = $('#form_saida').serialize(true);
        registrar_saida(form_saida);
        $("#form_saida :input").prop("disabled", true);
    });

    $("#corpo").on('click', 'a[id^=adicionar-produto-venda-]', function(){
        id_venda = $(this).attr('id').split('-')[3];
        status = $(this).attr('title');
        if (status != 'EM ANDAMENTO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é possível adicionar produtos a este pedido, pois o mesmo encontra-se "'+status+'"... ';
            mensagemInfo(titulo,mensagem);
        }else{
            limpaCamposFormSaida();
            $("#id_venda").val(id_venda);
            $.ajax({
            url : "/produtos/buscar-precos-tabelados/",
            type : "GET",
            data : { id_venda : id_venda },
            success : function(json) {
            $('#id_produtos_tabelados').empty().append('<option value=""></option>');
            $('#cupom-nao-fiscal').load('/vendas/imprimir-cupom-nao-fiscal/'+id_venda+'/');
            for(var i=0;json.length>i;i++){
                $('#id_produtos_tabelados').append('<option value="'+json[i].id_produto+'">'+json[i].produto+'</option>')
                }
            },

            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
            });
            if (parseInt($("#id_venda").val()) > 0){
                $("#id_codigo_barras").prop("disabled", false);
                $("#id_produto").prop("disabled", false);
                $("#id_produtos_tabelados").prop("disabled", false);
                $("#id_id_produto").prop("disabled", false);
                $("#id_observacoes_saida").prop("disabled", false);
                $('#tb-vendas').removeClass('in active');
                $('#form-saida-produtos').addClass('in active');
                $('#li-tb-vendas').removeClass('active');
                $('#li-form-saida-produtos').addClass('active');
            }else{
                mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Não é possível adicionar produtos a este pedido...');
            }
        }
    });

    $('#id_codigo_barras').on('change', function(event){
		codigo_barras = $(event.target).val();
		id_produto = 0;
		id_saida = 0;
        if (codigo_barras != ''){
         buscaProduto();
        }
	});

	$('#id_produto').on('change', function(event){
		id_produto = parseInt($(event.target).val());
		codigo_barras = '';
        if (id_produto > 0){
         buscaProduto();
        }
	});

	$('#id_produtos_tabelados').on('change', function(event){
		id_produto = parseInt($(event.target).val());
		codigo_barras = '';
        if (id_produto > 0){
         buscaProduto();
        }
	});

	$('#id_id_produto').on('change', function(event){
		id_produto = parseInt($(event.target).val());
		codigo_barras = '';
        if($("#id_id_produto").val().match(/(\d+[,.]\d+)/)){
            titulo = 'CÓDIGO PRODUTO INVÁLIDO...'
            mensagem = 'Digite somente numeros inteiros. Este campo não aceita pontos nem virgulas...';
            $("#id_id_produto").val('');
            $("#id_id_produto").focus();
            mensagemAlerta(titulo, mensagem);
        }else if(id_produto > 0){
            buscaProduto();
        }
	});

	$('#id_percentual_desconto').on('blur', function(event){
		quantidade = parseFloat($("#id_quantidade").val());
		if($("#id_percentual_desconto").val() != ''){
		    desconto = parseFloat($(event.target).val());
		    if((quantidade >= atacado_apartir) && (desconto < atacado_desconto)){
                $("#id_percentual_desconto").val(atacado_desconto.toFixed(3));
                mensagemInfo('DESCONTO OBRIGATÓRIO...','Este produto tem desconto promocional de '+ atacado_desconto.toFixed(3)+'% quando vendido apartir de '+ atacado_apartir+' '+ unidade_medida+'(s)...');
               }
		    if (desconto > desconto_maximo){
                titulo = 'DESCONTO NÃO AUTORIZADO...'
                if (desconto_maximo > 0.000){
                    mensagem = 'O maximo de desconto que se pode dar a este produto é, '+desconto_maximo+'%'

                    if((quantidade >= atacado_apartir)){
                        $("#id_percentual_desconto").val(atacado_desconto.toFixed(3));
                    }else{
                        $("#id_percentual_desconto").val('0.00');
                    }
                    calcularPedido()
                    $("#id_percentual_desconto").focus();
                    mensagemAlerta(titulo, mensagem);
                }else if (desconto_maximo == 0.000){
                    mensagem = 'Nã0 é possível dar descontos neste produto...'
                    $("#id_percentual_desconto").prop("disabled", true);
                    mensagemAlerta(titulo, mensagem);
                }
            }
        if(quantidade > 0 && desconto <= desconto_maximo){
            calcularPedido();
        }
		}else{
		    $("#id_percentual_desconto").val(0);
		}
		$("#id_percentual_desconto").val(parseFloat($("#id_percentual_desconto").val()).toFixed(3));
	});

	$('#id_quantidade').on('blur', function(event){
	    x = parseFloat($("#id_quantidade").val()).toFixed(2);
	    if($("#id_quantidade").val() != ''){
		    quantidade = parseFloat($("#id_quantidade").val());
            if (quantidade > 0){
                if(id_saida > 0){
                    estoque_atual += quantidade_anterior
                    entrada_automatica = 0
                    saida_automatica = 0
                    }
                    if(quantidade >= atacado_apartir && !preco_promocional){
                        if(atacado_desconto > 0){
                            $("#id_percentual_desconto").prop("disabled", true);
                            $("#id_percentual_desconto").val(atacado_desconto.toFixed(3));
                        }
                    }else if(!preco_promocional){
                        $("#id_percentual_desconto").val('0.00');
                    }
                estoque_total = estoque_atual + (quantidade_embalagem_fechada * estoque_embalagem_fechada);

                if(quantidade <= estoque_total){

                    if((quantidade % 1 > 0 && fracionar_produto == 'SIM') || (quantidade % 1 == 0 && fracionar_produto == 'NAO') || (quantidade % 1 == 0 && fracionar_produto == 'SIM')){

                        if(quantidade > estoque_atual){
                            contagem = 0
                            em_estoque = estoque_atual
                            entrada_automatica = 0
                            saida_automatica = 0
                            while(quantidade > em_estoque){
                                contagem++;
                                em_estoque += quantidade_embalagem_fechada
                                entrada_automatica += quantidade_embalagem_fechada
                                saida_automatica = contagem
                            }
                        }else{
                        entrada_automatica = 0;
                        saida_automatica = 0;
                        }
                        quantidade_baixa = quantidade - quantidade_anterior
                        calcularPedido();
                        if(desconto_maximo > atacado_desconto || (desconto_maximo > 0 && quantidade < atacado_apartir)){
                            if(!preco_promocional){
                            $("#id_percentual_desconto").prop("disabled", false);
                            $("#btn_registrar_saida").focus();
                            }
                        }
                    }else{
                        titulo = 'QUANTIDADE INVÁLIDA...'
                        mensagem = 'Este produto não pode ser fracionado, deve ser vendido sempre o(a) '
                        +unidade_medida+' completo(a)....'
                        $('#id_quantidade').focus();
                        $("#btn_registrar_saida").prop("disabled", true);
                        mensagemAlerta(titulo, mensagem);
                    }
                }else{
                    titulo = 'ESTOQUE INSUFICIENTE...'
                    mensagem = 'Não há produto suficiente em estoque...'
                    $('#id_quantidade').val("0.00");
                    $('#id_saldo_final').val("0.00");
                    $('#id_percentual_desconto').val("0.00");
                    $('#id_total_desconto').val("0.00");
                    $('#id_valor_total').val("0.00");
                    $("#id_percentual_desconto").prop("disabled", true);
                    calcularPedido();
                    $('#id_quantidade').focus();
                    $("#btn_registrar_saida").prop("disabled", true);
                    mensagemAlerta(titulo, mensagem);
                }

            }
            }else{
            titulo = 'QUANTIDADE INVÁLIDA...'
            mensagem = 'Você está vendo esta menságem, porque deixou a quantidade em branco, ou o sistema rejeitou '+
            'a virgulas na separação de casas decimais. Informe a quantidade ou troque a virgula por um ponto...';
            $("#id_quantidade").val('0');
            $("#id_quantidade").focus();
            mensagemAlerta(titulo, mensagem);
            $('#id_quantidade').val("0.00");
            $("#btn_registrar_saida").prop("disabled", true);
            }
            $("#id_quantidade").val(parseFloat($("#id_quantidade").val()).toFixed(3));
	});

    function calcularPedido(){
        quantidade = parseFloat($("#id_quantidade").val());
        desconto = parseFloat($("#id_percentual_desconto").val());
        preco_venda = parseFloat($("#id_valor_unitario").val());
        valor_desconto = (((desconto*quantidade)/100)*preco_venda)
        valor_total = (quantidade*preco_venda);
        saldo_final = ((quantidade*preco_venda)-valor_desconto);
        $("#id_total_desconto").val(valor_desconto.toFixed(2));
        $("#id_valor_total").val(valor_total.toFixed(2));
        $("#id_saldo_final").val(saldo_final.toFixed(2));
        if(saldo_final.toFixed(2) >= 0.05){
        $("#btn_registrar_saida").prop("disabled", false);
        }else if(saldo_final.toFixed(2) < 0.05 && x <= estoque_total){
            titulo = 'QUANTIDADE INVÁLIDA...';
            mensagem = 'A quantidade informada é muito baixa, tente vender uma quantidade que resulte em um saldo final superior a $ 0,05 pelo menos...';
            $("#id_quantidade").val("0.00");
            $("#id_percentual_desconto").val("0.00");
            $("#id_valor_total").val("0.00");
            $("#id_total_desconto").val("0.00");
            $("#id_saldo_final").val("0.00");
            $("#id_quantidade").focus();
            $("#btn_registrar_saida").prop("disabled", true);
            mensagemAlerta(titulo, mensagem);
        }
        //console.log('calculado');
    };

    function registrar_saida(form_saida){
    var id_venda = $('#id_venda').val()
    $.ajax({
        url : "/vendas/registrar-saida-produto/",
        type : "POST",
        data : { saida_id : $('#id_id_saida').val(),
                 form_saida : form_saida,
                 saida_automatica : saida_automatica,
                 entrada_automatica : entrada_automatica,
                 quantidade_baixa : quantidade_baixa,
                 quantidade_baixa : quantidade_baixa,
               },

        success : function(json) {
            if (json.erro){
                $("#btn_registrar_saida").prop("disabled", false);
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json)
            }

            else if(json.sucesso){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id_saida').val(json.id);
                $("#form :input").prop("disabled", true);
                $("#btn_alterar_pedido").prop("disabled", false);
                $("#btn_novo_item").prop("disabled", false);
                $("#btn_cancelar_pedido").prop("disabled", true);
                $("#btn_sair_pedido").prop("disabled", false);
                $("#imprimir-cupom").prop("disabled", false);
                id_saida = 0;
                codigo_barras = '';
                id_produto = 0;
                id_saida = 0;
                mensagemSucesso(json);
                itensVenda(json);
            }
            else if(json.alerta){
                titulo = json.titulo;
                mensagem = json.mensagem;
                $("#id_quantidade").prop("disabled", false);
                $("#btn_cancelar_pedido").prop("disabled", false);
                $("#btn_novo_item").prop("disabled", false);
                $('#id_quantidade').focus();
                mensagemAlerta(titulo, mensagem);

                }
                else if(json.erro2){
                limpaCamposFormSaida();
                mensagemErroOperacao(json);

                }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};

    $("#corpo").on('click', 'a[id^=alterar-item-]', function(){
        status = $(this).attr('title');
        if (status == 'EM SEPARACAO' || status == 'SEPARADO' || status == 'ENTREGUE'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem faz parte de um pedido já finalizado, por isto não é possível realizar alterações...';
            mensagemInfo(titulo, mensagem);
        }else if(status == 'CANCELADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem foi cancelado, por isto não é possível realizar alterações...';
            mensagemInfo(titulo, mensagem);
        }else if(status == 'AGUARDANDO'){
             id_saida = $(this).attr('id').split('-')[2];
             limpaCamposFormSaida();
             $("#form_saida :input").prop("disabled", true);
             $("#id_observacoes_saida").prop("disabled", false);
             $("#id_quantidade").prop("disabled", false);
             $("#btn_sair_pedido").prop("disabled", false);
             $("#btn_cancelar_pedido").prop("disabled", false);
             $("#btn_novo_item").prop("disabled", true);
             $("#imprimir-cupom").prop("disabled", false);
             codigo_barras = '';
             id_produto = 0;
             buscaProduto();
         }
    });


    $("#corpo").on('click', 'a[id^=muda-status-item-]', function(){
        status = $(this).attr('title');
        if (status == 'CANCELADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem foi cancelado, por isto não é possível alterar o seu státus...';
            mensagemInfo(titulo,mensagem);
        }else if(status == 'ENTREGUE'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é possível mudar o státus deste ítem,pois o mesmo faz parte de pedido já entregue...';
            mensagemInfo(titulo,mensagem);
        }else if(status == 'AGUARDANDO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é possível mudar o státus deste ítem,pois o mesmo está aguardando a conclusão do pedido...';
            mensagemInfo(titulo,mensagem);
        }else{
        var id_item = $(this).attr('id').split('-')[3];
        $.ajax({
            url : "muda-status-item/",
            type : "POST",
            data : { id_item : id_item},
            success : function(json) {
                if (json.sucesso){
                    $('#muda-status-item-'+id_item).html("<span>"+json.status+"</span>");
                    mensagemSucesso(json)
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
        }
    });

    $("#corpo").on('click', 'a[id^=cancelar-item-]', function(){
        status = $(this).attr('title');
        if (status == 'CANCELADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem já encontra-se cancelado...';
            mensagemInfo(titulo,mensagem);
        }else if(status == 'ENTREGUE'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem não pode ser cancelado, pois o mesmo faz prte de um pedido já entregue...';
            mensagemInfo(titulo,mensagem);
        }else{
            id_saida = $(this).attr('id').split('-')[2];
            $.SmartMessageBox({
					title : "ALERTA!!!",
					content : "TER CERTEZA QUE DESEJA CANCELAR ESTE ÍTEM???<br>Lembramos que, não será possível reverter o processo de cancelamento...",
					buttons : '[SIM][NÃO]'
				}, function(ButtonPressed) {
					if (ButtonPressed === "SIM") {
				        cancelarItem(id_saida)
					}
					if (ButtonPressed === "NÃO") {
						mensagemInfo('AÇÃO INTERROMPIDA...', 'A ação foi interrompida com sucesso, o ítem não foi cancelada...')
					}
				});
        }
    });

    function cancelarItem(id_saida) {
        $.ajax({
            url : "/vendas/cancelar-saida-produto/",
            type : "POST",
            data : { id_saida : id_saida },
            success : function(json) {
                if (json.sucesso){
                $('#saldofinal').html("<span>Valor total: <strong>$ "+parseFloat(json.valor_total).toFixed(2)+"</strong></span>");
                $('#informativo_venda').html("<span>000"+json.id_pedido+" - "+json.cliente+" ( <strong>$ "+parseFloat(json.valor_total).toFixed(2)+"</strong> )</span>");
                    $('#linha-'+id_saida).hide();
                    mensagemSucesso(json)
                }
                else if (json.erro){
                    mensagemErroOperacao(json)
                }else if (json.info){
                alert(json.status_saida);
                    mensagemInfo(json.titulo, json.mensagem)
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };

});
    function itensVenda(json){
        $('#informativo_venda').html("<span>000"+json.id_pedido+" - "+json.cliente+" ( <strong>R$ "+parseFloat(json.valor_total).toFixed(2)+"</strong> )</span>");
        $('#info_venda').html("<h6>Data do pedido: <strong> "+json.data_venda+"</strong></h6>"+
        "<h6>Data da entrega: <strong> "+json.data_entrega+"</strong></h6>"+
        "<h6>Pedido por: <strong> "+json.solicitante+"</strong></h6>"+
        "<h6>Státus: <strong> "+json.status_pedido+"</strong></h6>"+
        "<h2 id='saldofinal'>Valor total: <strong>R$ "+parseFloat(json.valor_total).toFixed(2)+"</strong></h2>");
        $('#datatable_tabletools').hide();
        $('#tabela-itens').html(
                    '<table id="tb_itens" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                        '<tr style="white-space: nowrap;">'+
                            '<th data-class="expand">ID</th>'+
                            '<th data-hide="phone,tablet">Cliente</th>'+
                            '<th> Descricao do produto</th>'+
                            '<th data-hide="phone,tablet"> Quantidade</th>'+
                            '<th data-hide="phone,tablet"> Valor unit</th>'+
                            '<th data-hide="phone,tablet"> Valor total</th>'+
                            '<th data-hide="phone,tablet"> Desc %</th>'+
                            '<th data-hide="phone,tablet"> Total desc</th>'+
                            '<th data-hide="phone,tablet"> Saldo final</th>'+
                            '<th data-hide="phone,tablet">Data</th>'+
                            '<th data-hide="phone,tablet">Státus</th>'+
                            '<th data-hide="phone,tablet">Empresa</th>'+
                            '<th data-hide="phone,tablet">Oservações</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody style="white-space: nowrap;">'+
                '</tbody">'+
                '</table>'
                    )
                itens = json.itens;
                for(var i=0;itens.length>i;i++){
                    $('#tb_itens').append('<tr id="linha-'+itens[i].id+'">'+
                    '<td class="'+itens[i].classe+'">'+itens[i].id+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].venda+'</td>'+
                    '<td class="'+itens[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+itens[i].produto+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-registro-'+itens[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+itens[i].descricao_simplificada+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+itens[i].status+'" id="alterar-item-'+itens[i].id+'">ALTERAR ÍTEM</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;color:black;" title="'+itens[i].status+'" id="cancelar-item-'+itens[i].id+'">CANCELAR ÍTEM</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].quantidade+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].valor_unitario+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].valor_total+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].percentual_desconto+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].total_desconto+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].saldo_final+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].data_saida+'</td>'+
                        '<td class="'+itens[i].classe+'" style="white-space: nowrap;">'+
                        '<div id="registro-'+itens[i].id+'">'+
                            '<a style="cursor:pointer;" title="'+itens[i].status+'" id="muda-status-item-'+itens[i].id+'">'+
                                '<span>'+itens[i].status+'</span>'+
                            '</a>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].empresa+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].observacoes_saida+'</td>'+
                    '</tr>'
                    )

                }
                var responsiveHelper_tb_itens = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

                  $('#tb_itens').dataTable({
					"sDom": "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-12 hidden-xs'l>r>"+
						"t"+
						"<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
					"autoWidth" : true,
					"scrollX": true,
                    //"scrollY":"400px",
                    scrollY: '50vh',
                    //"scrollCollapse": true,
                    //"paging": false,
                    "stateSave": true,
			        "oLanguage": {
					    "sSearch": '<span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>'
					},
					"preDrawCallback" : function() {
						// Initialize the responsive datatables helper once.
						if (!responsiveHelper_tb_itens) {
							responsiveHelper_tb_itens = new ResponsiveDatatablesHelper($('#tb_itens'), breakpointDefinition);
						}
					},
					"rowCallback" : function(nRow) {
						responsiveHelper_tb_itens.createExpandIcon(nRow);
					},
					"drawCallback" : function(oSettings) {
						responsiveHelper_tb_itens.respond();
					}
				});
				$('#cupom-nao-fiscal').load('/vendas/imprimir-cupom-nao-fiscal/'+json.id_pedido+'/');
    };


function buscaProduto(){
        $.ajax({
            url : "busca-produto/",
            type : "GET",
            data : { codigo_barras : codigo_barras,
                    id_produto : id_produto,
                    id_saida : id_saida,
                    id_venda : $("#id_venda").val() },

            success : function(json) {
                if (json.sucesso){
                    $('.form-group').removeClass('has-error').removeClass('has-success');
                    $("#id_produto").prop("disabled", true);
                    $('#id_produto').val(json.id);
                    $('#id_produtos_tabelados').val(json.id);
                    $('#id_valor_unitario').val(json.preco_venda);
                    $("#id_quantidade").prop("disabled", false);
                    $("#btn_cancelar_pedido").prop("disabled", false);
                    $('#id_quantidade').focus();
                    $("#id_id_produto").prop("disabled", true);
                    $("#id_produtos_tabelados").prop("disabled", true);
                    $("#id_codigo_barras").prop("disabled", true);
                    $("#id_observacoes_saida").val(json.observacoes);
                    desconto_maximo = parseFloat(json.desconto_maximo);
                    estoque_atual = parseFloat(json.estoque_atual);
                    id_embalagem_fechada = parseInt(json.id_embalagem_fechada);
                    quantidade_embalagem_fechada = parseFloat(json.quantidade_embalagem_fechada);
                    estoque_embalagem_fechada = parseFloat(json.estoque_embalagem_fechada);
                    atacado_apartir = parseFloat(json.atacado_apartir);
                    atacado_desconto = parseFloat(json.atacado_desconto);
                    preco_venda = parseFloat(json.preco_venda);
                    fracionar_produto = json.fracionar_produto;
                    unidade_medida = json.unidade_medida;
                    preco_promocional = json.preco_promocional
                    if(json.preco_promocional){
                        $("#id_percentual_desconto").val(json.desconto_maximo);
                    }
                }else if(json.erro){
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemErroOperacao(json);
                limpaCamposFormSaida();
                }else if(json.alerta){
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemAlerta(titulo, mensagem);
                limpaCamposFormSaida();
                }else if(json.permissao_negada){
                mensagemErroOperacao(json);
                }

                if(json.id_saida > 0){
                    for (var i in json.campos) {
                        $('#id_id_saida').val(json.id_saida);
                        $('#'+i).val(json.campos[i]).val;
                    }
                    fechaGuias();
                    $('#li-form-saida-produtos').addClass('in active');
                    $('#form-saida-produtos').addClass('in active');
                   //mensagemSucesso(json)
                }
            },

            error : function(xhr,errmsg,err) {
                limpaCamposFormSaida()
                //$("#form_saida :input").prop("disabled", true);
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };

function limpaCamposFormSaida(){
        $('#id_quantidade').val("0.000");
		$('#id_percentual_desconto').val("0.000");
		$('#id_total_desconto').val("0.00");
		$('#id_valor_unitario').val("0.000");
		$('#id_valor_total').val("0.00");
		$('#id_saldo_final').val("0.00");
		$('#id_produto').val('');
		$('#id_produtos_tabelados').val('');
		$('#id_id_saida').val("0");
		$('#id_id_produto').val("0");
		$('#id_codigo_barras').val("");
		$('#id_observacoes_saida').val('');
		$('.form-group').removeClass('has-error').removeClass('has-success');
};

