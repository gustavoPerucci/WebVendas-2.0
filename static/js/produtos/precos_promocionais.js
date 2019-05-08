$(function(){
    var registro_id = 0;
    var id_produto = 0;
    var valor_compra = 0;
    var preco_venda = 0;
    var percentual = 0;
    var desconto = 0;
    var percentual_decconto = 0;
    var valor_venda = 0;
    var codigo_barras = '';

    $('#form3').on('submit', function(event){
        event.preventDefault();
       $("#form3 :input").prop("disabled", false);
        var form = $('#form3').serialize(true);
        $("#form3 :input").prop("disabled", true);
        salvar(form);
    });

    $('#id_percentual_desconto').on('change', function(event){
		event.preventDefault();
        percentual = parseFloat($(event.target).val()/100).toFixed(3);
        if(percentual <= 0){
        $('#id_percentual_desconto').val(percentual_desconto);
        $('#id_preco_venda_promocao').val(valor_venda);
        $("#btn_salvar_promocao").prop("disabled", true);
        titulo = 'PREÇOS PROMOCIONAIS...'
        mensagem = 'O desconto deve ser maior que $0,00.'
        mensagemAlerta(titulo, mensagem);
        }else if(percentual > 1){
        $('#id_percentual_desconto').val('0.000');
        $('#id_preco_venda_promocao').val(valor_venda);
        $("#btn_salvar_promocao").prop("disabled", true);
        titulo = 'PREÇOS PROMOCIONAIS...'
        mensagem = 'O desconto não pode ultrapassar os 100%.'
        mensagemAlerta(titulo, mensagem);
        }else{
        desconto = parseFloat(percentual*valor_venda).toFixed(3);
        preco_venda = (parseFloat(valor_venda)-parseFloat(desconto)).toFixed(2);
        $('#id_preco_venda_promocao').val(preco_venda);
        $('#id_percentual_desconto').val(parseFloat($(event.target).val()).toFixed(3));
        $("#btn_salvar_promocao").prop("disabled", false);
        $("#btn_cancelar_promocao").prop("disabled", false);
        if(preco_venda < valor_compra){mensagemAlerta('ATENÇÃO!!!', 'Este produto estatá sendo vendido por um preço inferior ao seu valor de compra, que é de $'+valor_compra)}
        }
	});

     $('#id_preco_venda_promocao').on('change', function(event){
		event.preventDefault();
        preco_venda = parseFloat($(event.target).val());
        if(preco_venda < 0.0){
        $('#id_percentual_desconto').val(percentual_desconto);
        $('#id_preco_venda_promocao').val(valor_venda);
        $("#btn_salvar_promocao").prop("disabled", true);
        titulo = 'PREÇOS PROMOCIONAIS...'
        mensagem = 'O preço de venda do produto não pode ser inferior a $0,00...'
        mensagemAlerta(titulo, mensagem);
        }else if(preco_venda > valor_venda){
        $('#id_percentual_desconto').val('0.000');
        $('#id_preco_venda_promocao').val(valor_venda);
        $("#btn_salvar_promocao").prop("disabled", true);
        titulo = 'PREÇOS PROMOCIONAIS...'
        mensagem = 'O preço promocional do produto não pode ser maior que seu preço normal...'
        mensagemAlerta(titulo, mensagem);
        }else if(preco_venda <= valor_venda){
        percentual = (((preco_venda-valor_venda)*100)/valor_venda).toFixed(3)*-1;
        $('#id_percentual_desconto').val(percentual);
        $('#id_preco_venda_promocao').val(parseFloat($(event.target).val()).toFixed(2));
         $("#btn_salvar_promocao").prop("disabled", false);
         $("#btn_cancelar_promocao").prop("disabled", false);
        if(preco_venda < valor_compra){mensagemAlerta('ATENÇÃO!!!', 'Este produto estatá sendo vendido por um preço inferior ao seu valor de compra, que é de $'+valor_compra)}
        }
	});

	$('#id_produto_promocao').on('change', function(event){
		 event.preventDefault();
		 id_produto = parseInt($(event.target).val());
		 codigo_barras = '';
         $('#id_percentual_desconto').val('0.000');
         $('#id_preco_venda_promocao').val('0.000');
         $('#id_preco_venda_promocao').val('0.000');
         if(id_produto > 0){
         $("#id_percentual_desconto").prop("disabled", false);
         $("#id_preco_venda_promocao").prop("disabled", false);
         $("#id_observacoes_promocao").prop("disabled", false);
         $("#btn_salvar_promocao").prop("disabled", true);
         buscaProduto(id_produto, codigo_barras);
         }else{
         $("#id_percentual_desconto").prop("disabled", true);
         $("#id_preco_venda_promocao").prop("disabled", true);
         $("#id_observacoes_promocao").prop("disabled", true);
         }
	});

	$('#promocao_nova').on('click', function(event){
		event.preventDefault();
		limpaCampos();
	    $("#btn_nova_promocao").prop("disabled", true);
	    $("#btn_cancelar_promocao").prop("disabled", false);
	    $("#btn_alterar_promocao").prop("disabled", true);
	    $("#btn_registrar_promocao").prop("disabled", true);
	    $("#id_produto_promocao").prop("disabled", false);
	    $("#id_codigo_de_barras").prop("disabled", false);
	    fechaGuias();
        $('#li-form-precos-promocao').addClass('active');
        $('#form-precos-promocao').addClass('in active');
	});

	$('#produtos_em_promocao').on('click', function(event){
		event.preventDefault();
		fechaGuias()
        $('#li-tb-precos-promocao').addClass('active');
        $('#tb-precos-promocao').addClass('in active');
		id_produto = 0;
		codigo_barras = '';
		buscarProdutosPromocao(id_produto, codigo_barras);
	});

	$('#produtos_em_promocao_pdf').on('click', function(event){
        $.ajax({
            url : '/produtos/precos-promocionais-pdf/',
            type : "GET",
            data : {verifica_permissoes : 1,},

            success : function(json) {
                if (json.permissoes){
                window.open('/produtos/precos-promocionais-pdf/');               
                }else if(json.erro){
                mensagemErroOperacao(json)
                }else if(json.info){
                mensagemInfo(json.titulo, json.mensagem)
                }
            },

            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    });


	$('#busca-produto-promocao').on('change', function(event){
		 event.preventDefault();
	    if($("#busca-produto-promocao").val() != ''){
	    id_produto = parseInt($("#busca-produto-promocao").val());
	    if(id_produto > 0){
	    codigo_barras = '';
	    buscarProdutosPromocao(id_produto, codigo_barras);
	    };
	    };
	});

	$('#busca-produto-promocao-barras').on('change', function(event){
		 event.preventDefault();
	    if($("#busca-produto-promocao-barras").val() != ''){
            id_produto = 0;
            codigo_barras = $("#busca-produto-promocao-barras").val();
            buscarProdutosPromocao(id_produto, codigo_barras);
	    };
	});

    $('#id_codigo_de_barras').on('change', function(event){
		codigo_barras = $(event.target).val();
		id_produto = 0;
        if (codigo_barras != ''){
         buscaProduto(id_produto, codigo_barras);
        }
	});

	$('#btn_cancelar_promocao').on('click', function(event){
		event.preventDefault();
		limpaCampos()
	    $("#form3 :input").prop("disabled", true);
	    $("#btn_nova_promocao").prop("disabled", false);
	});

	$('#btn_nova_promocao').on('click', function(event){
		event.preventDefault();
		limpaCampos();
	    $("#btn_nova_promocao").prop("disabled", true);
	    $("#btn_cancelar_promocao").prop("disabled", false);
	    $("#btn_alterar_promocao").prop("disabled", true);
	    $("#btn_registrar_promocao").prop("disabled", true);
	    $("#id_produto_promocao").prop("disabled", false);
	    $("#id_codigo_de_barras").prop("disabled", false);
	});

	$('#btn_alterar_promocao').on('click', function(event){
		event.preventDefault();
		habilitaCampos();
	});

	$("#corpo").on('click', 'a[id^=buscar-preco-promocao-produto-]', function(){
        id_produto = $(this).attr('id').split('-')[4];
        codigo_barras = '';
        buscarProdutosPromocao(id_produto, codigo_barras)
    });

    function limpaCampos(){
        $('#id_percentual_desconto').val('0.000');
        $('#id_valor_compra_promocao').val('0.000');
         $('#id_preco_venda_promocao').val('0.000');
        $('#id_id_preco_promocao').val('0');
        $('#id_produto_promocao').val('');
	    $("#id_observacoes_promocao").val('');
	    $("#id_inicio_promocao").val('');
	    $("#id_fim_promocao").val('');
	    $("#id_codigo_de_barras").val('');
    };

    function habilitaCampos(){
       $("#form3 :input").prop("disabled", false);
	   $("#id_id_preco_promocao").prop("disabled", true);
	    $("#id_valor_compra_promocao").prop("disabled", true);
	    $("#id_produto_promocao").prop("disabled", true);
	    $("#btn_alterar_promocao").prop("disabled", true);
	    $("#id_codigo_de_barras").prop("disabled", true);
	    $("#btn_nova_promocao").prop("disabled", true);

    };

    function salvar(form){
    $.ajax({
        url : "/produtos/registrar-promocao/",
        type : "POST",
        data : { id : $('#id_id_preco_promocao').val(), form : form},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                $("#btn_cancelar_promocao").prop("disabled", false);
                habilitaCampos();
                mensagemErroOperacao(json)
            }

            else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id_preco_promocao').val(json.id);
                $("#form3 :input").prop("disabled", true);
                $("#btn_nova_promocao").prop("disabled", false);
                $("#btn_alterar_promocao").prop("disabled", false);
                mensagemSucesso(json)
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};


function buscaProduto(id_produto, codigo_barras){
        $.ajax({
            url : "/produtos/busca-produto/",
            type : "GET",
            data : {id_produto : id_produto, codigo_barras : codigo_barras },
            success : function(json) {
                if (json.sucesso){
                    $('.form-group').removeClass('has-error').removeClass('has-success');
                    $('#id_produto_promocao').val(json.id);
                    $('#id_codigo_de_barras').val(json.codigo_barras);
                    valor_compra = parseFloat(json.valor_compra).toFixed(2);
                    percentual_desconto = parseFloat(json.desconto_maximo).toFixed(3);
                    valor_venda = parseFloat(json.preco_venda).toFixed(3);
                    $('#id_valor_compra_promocao').val(valor_compra);
                    habilitaCampos();
                    if(parseFloat($('#id_percentual_desconto').val()) < 0.001){
                    $('#id_percentual_desconto').val('0.000');
                    }
                    if(parseFloat($('#id_preco_venda_promocao').val()) < 0.001){
                    $('#id_preco_venda_promocao').val(json.preco_venda);
                    }
                    $('#id_percentual_desconto').focus();
                    //$('#id_preco_venda_promocao').trigger("change");
                    if(valor_compra == 0){
                    mensagem = 'Não é possível por este produto em promoção, pois o mesmo não possui um valor de compra definido...';
                    titulo = 'PREÇOS PROMOCIONAIS';
                    $("#form3 :input").prop("disabled", true);
                    $("#id_produto_promocao").prop("disabled", false);
                    $("#id_produto_promocao").val('');
                    mensagemAlerta(titulo, mensagem);
                    }
                }else if(json.erro){
                $("#form3 :input").prop("disabled", true);
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemErroOperacao(json);
                }else if(json.alerta){
                //$("#form3 :input").prop("disabled", true);
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemAlerta(titulo, mensagem);
                }else if(json.permissao_negada){
                $("#form3 :input").prop("disabled", true);
                mensagemErroOperacao(json);
                }
            },

            error : function(xhr,errmsg,err) {
                $("#form3 :input").prop("disabled", true);
                mensagemErroSistema();
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };

    $("#corpo").on('click', 'a[id^=alterar-promocao-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        buscarRegistro(registro_id);
    });

    $("#corpo").on('click', 'a[id^=muda_status_promocao_2-]', function(){
        registro_id = $(this).attr('id').split('-')[1];
        mudaStatusPromocao(registro_id)
        });

    $("#corpo").on('click', 'a[id^=muda_status_promocao-]', function(){
        registro_id = $(this).attr('id').split('-')[1];
        mudaStatusPromocao(registro_id)
        });

    function mudaStatusPromocao(registro_id){
        $.ajax({
            url : "/produtos/muda-status-promocao/",
            type : "POST",
            data : { registro_id : registro_id },
            success : function(json) {
             if(json.sucesso){
                $('#muda_status_promocao_2-'+registro_id).html("<span>"+json.status_preco+"</span>");
                mensagemSucesso(json)
                }else if(json.erro){
                mensagemErroOperacao(json);
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema();
            },
        });
    };

    $("#corpo").on('click', 'a[id^=excluir-promocao-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        $.ajax({
            url : "/produtos/excluir-promocao/",
            type : "DELETE",
            data : { registro_id : registro_id },
            success : function(json) {
                if(json.sucesso){
                $('#preco-promocional-'+registro_id).hide();
                mensagemSucesso(json);
                }else if(json.erro){
                mensagemErroOperacao(json);
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema();
            },
        });
    });

    function buscarRegistro(registro_id) {
        $.ajax({
            url : "/produtos/buscar-promocao/",
            type : "GET",
            data : { id : registro_id},

            success : function(json){
                //alert(json.mensagem);
                if(json.sucesso){
                    $('.form-group').removeClass('has-error').addClass('has-success');
                    $('#id_id_preco_promocao').val(json.id);
                    $("#id_percentual_desconto").prop("disabled", false);
                    $("#id_preco_venda_promocao").prop("disabled", false);
                    $("#btn_nova_promocao").prop("disabled", true);
                    $("#btn_cancelar_promocao").prop("disabled", false);
                    $("#id_observacoes_promocao").prop("disabled", false);
                    for (var i in json.campos) {
                        $('#'+i).val('');
                        $('#'+i).val(json.campos[i]).val;
                    }
                    id_produto = $("#id_produto_promocao").val();
                    codigo_barras = '';
                    buscaProduto(id_produto, codigo_barras);
                    fechaGuias();
                    $('#li-form-precos-promocao').addClass('active');
                    $('#form-precos-promocao').addClass('in active');
                    //$("#form :input").prop("disabled", true);
                    //mensagemSucesso(json)
                }else if(json.alerta){
                mensagemAlerta(json.titulo, json.mensagem);
                }else if(json.permissao_negada){
                mensagemErroOperacao(json);
                }
            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };


    function buscarProdutosPromocao(id_produto, codigo_barras){
        $('#precos_promocionais tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "/produtos/buscar-promocoes/",
            type : "GET",
            data : { id_produto: id_produto, codigo_barras: codigo_barras },
            success : function(json) {
                    $('#precos-promocionais').html(
                    '<table id="precos_promocionais" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                        '<tr style="white-space: nowrap;">'+
                            '<th data-class="expand">ID</th>'+
                            '<th data-hide="phone">Produto</th>'+
                            '<th data-hide="phone,tablet">Desconto %</th>'+
                            '<th data-hide="phone,tablet">Preco venda</th>'+
                            '<th data-hide="phone,tablet">Vigencia da promoção</th>'+
                            '<th data-hide="phone,tablet">Status</th>'+
                            '<th data-hide="phone,tablet">Empresa</th>'+
                            '<th data-hide="phone,tablet">Observacoes</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody style="white-space: nowrap;">'+
                '</tbody>'+
                '</table>'

                    )
                for(var i=0;json.length>i;i++){
                    $('#precos_promocionais').append('<tr  id="preco-promocional-'+json[i].id+'">'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].produto_promocao+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="background-color:black;">'+
                                        '<li class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].descricao_simplificada+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="alterar-promocao-'+json[i].id+'">ALTERAR PREÇOO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="muda_status_promocao-'+json[i].id+'">MUDAR STÁTUS</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="excluir-promocao-'+json[i].id+'">EXCLUIR PROMOÇÃO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].percentual_desconto+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].preco_venda_promocao+'</td>'+
                    '<td class="'+json[i].classe+'">Promoção válida de '+json[i].inicio_promocao+' à '+json[i].fim_promocao+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div id="registro-'+json[i].id+'">'+
                            '<a style="cursor:pointer;" id="muda_status_promocao_2-'+json[i].id+'">'+
                                '<span>'+json[i].status_promocao+'</span>'+
                            '</a>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].empresa+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].observacoes_promocao+'</td>'+
                    '</tr>'
                    )
                }
                pageSetUp();

                var responsiveHelper_precos_promocionais = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

                /* COLUMN SHOW - HIDE */
			$('#precos_promocionais').dataTable({
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
					if (!responsiveHelper_precos_promocionais) {
						responsiveHelper_precos_promocionais = new ResponsiveDatatablesHelper($('#precos_promocionais'), breakpointDefinition);
					}
				},
				"rowCallback" : function(nRow) {
					responsiveHelper_precos_promocionais.createExpandIcon(nRow);
				},
				"drawCallback" : function(oSettings) {
					responsiveHelper_precos_promocionais.respond();
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
});