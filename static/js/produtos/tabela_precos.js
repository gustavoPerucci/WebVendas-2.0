$(function(){
    var registro_id = 0;
    var id_produto = 0;
    var id_cliente = 0;
    var valor_compra = 0;
    var preco_venda = 0;
    var percentual = 0;
    var lucro = 0;
    var percentual_lucro = 0;
    var valor_venda = 0;
    var codigo_barras = '';

    $('#form2').on('submit', function(event){
        event.preventDefault();
       $("#form2 :input").prop("disabled", false);
        var form = $('#form2').serialize(true);
        $("#form2 :input").prop("disabled", true);
        $("#id_percentual").prop("disabled", false);
         $("#id_preco_venda").prop("disabled", false);
         $("#id_observacoes_preco").prop("disabled", false);
         $("#id_produto").prop("disabled", false);
         $("#id_cliente").prop("disabled", false);
        salvar(form);
    });

    $('#id_percentual').on('change', function(event){
		event.preventDefault();
        percentual = parseFloat($(event.target).val()/100).toFixed(3);
        if(percentual < 0){
        $('#id_percentual').val(percentual_lucro);
        $('#id_preco_venda').val(valor_venda);
        $("#btn_salvar_preco").prop("disabled", true);
        titulo = 'TABELANDO PREÇOS...'
        mensagem = 'O percentual não pode ser inferior a 0.00. Lembre-se, caso você opte por um percentual 0.00, '+
        'estará vendendo seu produto pelo mesmo preço que o comprou.'
        mensagemAlerta(titulo, mensagem);
        }else{
        if (percentual == 0){
        mensagemAlerta('ATENCÃO!!!', 'Optando em aplicar um percentual de lucros zero, voçe estará vendendo seu produto pelo mesmo preço de compra, e isto poderá acarretar prejuizos para a empresa... ');
        }
        lucro = parseFloat(percentual*valor_compra).toFixed(3);
        preco_venda = (parseFloat(valor_compra)+parseFloat(lucro)).toFixed(2);
        $('#id_preco_venda').val(preco_venda);
        $('#id_percentual').val(parseFloat($(event.target).val()).toFixed(3));
        $("#btn_salvar_preco").prop("disabled", false);
        $("#btn_cancelar_preco").prop("disabled", false);
        }
	});

     $('#id_preco_venda').on('change', function(event){
		event.preventDefault();
        preco_venda = parseFloat($(event.target).val());
        if(preco_venda < valor_compra){
        $('#id_percentual').val(percentual_lucro);
        $('#id_preco_venda').val(valor_venda);
        $("#btn_salvar_preco").prop("disabled", true);
        titulo = 'TABELANDO PREÇOS...'
        mensagem = 'O preço de venda não pode ser inferior ao valor da compra do produto, que, neste caso é de: '+valor_compra+'...'
        mensagemAlerta(titulo, mensagem);
        }else{
        percentual = (((preco_venda-valor_compra)*100)/valor_compra).toFixed(3);
        $('#id_percentual').val(percentual);
        $('#id_preco_venda').val(parseFloat($(event.target).val()).toFixed(2));
        }
        if(preco_venda > 0){
         $("#btn_salvar_preco").prop("disabled", false);
         $("#btn_cancelar_preco").prop("disabled", false);
        }
	});

	$('#id_codigo_de_barras_produto').on('change', function(event){
		 event.preventDefault();
		 codigo_barras = $(event.target).val();
		 id_produto = 0;
         $('#id_percentual').val('0.000');
         $('#id_preco_venda').val('0.000');
         if(codigo_barras != ''){
         buscaProduto(id_produto, codigo_barras);
         }else{
         $("#id_percentual").prop("disabled", true);
         $("#id_preco_venda").prop("disabled", true);
         $("#id_observacoes_preco").prop("disabled", true);
         }
	});

	$('#id_produto').on('change', function(event){
		 event.preventDefault();
		 id_produto = parseInt($(event.target).val());
		 codigo_barras = '';
         $('#id_percentual').val('0.000');
         $('#id_preco_venda').val('0.000');
         if(id_produto > 0){
         $("#id_percentual").prop("disabled", false);
         $("#id_preco_venda").prop("disabled", false);
         $("#id_observacoes_preco").prop("disabled", false);
         $("#btn_salvar_preco").prop("disabled", true);
         buscaProduto(id_produto, codigo_barras);
         }else{
         $("#id_percentual").prop("disabled", true);
         $("#id_preco_venda").prop("disabled", true);
         $("#id_observacoes_preco").prop("disabled", true);
         }
	});

	$('#id_cliente').on('change', function(event){
		event.preventDefault();
		id_cliente = parseInt($(event.target).val());
         if(id_cliente > 0){
         $("#id_produto").prop("disabled", false);
         $("#id_codigo_de_barras_produto").prop("disabled", false);
         $("#id_percentual").prop("disabled", true);
         $("#id_preco_venda").prop("disabled", true);
         $("#btn_salvar_preco").prop("disabled", true);
         $("#id_observacoes_preco").prop("disabled", true);
         $('#id_id_preco').val('0');
         $('#id_percentual').val('0.000');
         $('#id_preco_venda').val('0.000');
         $('#id_produto').val('');
         $("#id_observacoes_preco").val('');
         }else{
         $("#form2 :input").prop("disabled", true);
         $("#id_cliente").prop("disabled", false);
         $('#id_percentual').val('0.000');
         $('#id_preco_venda').val('0.000');
         $('#id_id_preco').val('0');
         $('#id_produto').val('');
         $('#id_codigo_de_barras_produto').val('');
         }
	});

	$('#precos_novo').on('click', function(event){
		event.preventDefault();
		limpaCampos()
	    $("#form2 :input").prop("disabled", true);
	    $("#id_cliente").prop("disabled", false);
	    $("#btn_novo_preco").prop("disabled", true);
	    $("#btn_cancelar_preco").prop("disabled", false);
	    fechaGuias();
        $('#li-form-tabela-precos').addClass('active');
        $('#form-tabela-precos').addClass('in active');
	});

	$('#precos_tabelados').on('click', function(event){
		event.preventDefault();
		 fechaGuias()
         $('#li-tb-precos').addClass('active');
         $('#tb-precos').addClass('in active');
		id_cliente = 0;
		id_produto = 0;
		codigo_barras = '';
		buscarPrecosTabelados(id_produto, id_cliente, codigo_barras)
	});

	$('#busca-preco-cliente').on('change', function(event){
	    event.preventDefault();
	    if($("#busca-preco-cliente").val() != ''){
	    id_cliente = parseInt($("#busca-preco-cliente").val());
	    if($("#busca-preco-produto").val() != ''){
	    id_produto = parseInt($("#busca-preco-produto").val());
	    codigo_barras = '';
	    $("#busca-preco-barras").val('');
	    }else if($("#busca-preco-barras").val() != ''){
	    id_produto = 0;
	    codigo_barras = $("#busca-preco-barras").val();
	    }else{
	    codigo_barras = '';
	    id_produto = 0;
	    };
	    if(id_cliente > 0 && id_produto >= 0){
	    buscarPrecosTabelados(id_produto, id_cliente, codigo_barras);
	    };
	    };
	});

	$('#busca-preco-produto').on('change', function(event){
		event.preventDefault();
		$("#busca-preco-barras").val('');
		codigo_barras = '';
	    if($("#busca-preco-produto").val() != ''){
	    id_produto = parseInt($("#busca-preco-produto").val());
	    if($("#busca-preco-cliente").val() != ''){
	    id_cliente = parseInt($("#busca-preco-cliente").val());
	    }else{id_cliente = 0};
	    if(id_produto > 0 && id_produto >= 0){
	    buscarPrecosTabelados(id_produto, id_cliente, codigo_barras);
	    };
	    };
	});

	$('#busca-preco-barras').on('change', function(event){
		event.preventDefault();
		$("#busca-preco-produto").val('');
		id_produto = 0;
	    if($("#busca-preco-barras").val() != ''){
	    codigo_barras = $("#busca-preco-barras").val();
	    if($("#busca-preco-cliente").val() != ''){
	    id_cliente = parseInt($("#busca-preco-cliente").val());
	    }else{id_cliente = 0};
	    if(codigo_barras != ''){
	    buscarPrecosTabelados(id_produto, id_cliente, codigo_barras);
	    };
	    };
	});

	$('#btn_cancelar_preco').on('click', function(event){
		event.preventDefault();
		limpaCampos()
	    $("#form2 :input").prop("disabled", true);
	    $("#btn_novo_preco").prop("disabled", false);
	});

	$('#btn_novo_preco').on('click', function(event){
		event.preventDefault();
		limpaCampos()
	    $("#form2 :input").prop("disabled", true);
	    $("#id_cliente").prop("disabled", false);
	    $("#btn_novo_preco").prop("disabled", true);
	    $("#btn_cancelar_preco").prop("disabled", false);
	});

	$('#btn_alterar_preco').on('click', function(event){
		event.preventDefault();
	    $("#id_percentual").prop("disabled", false);
	    $("#id_preco_venda").prop("disabled", false);
	    $("#id_observacoes_preco").prop("disabled", false);
	    $("#btn_cancelar_preco").prop("disabled", false);
	});

	$("#corpo").on('click', 'a[id^=buscar-tabela-preco-produto-]', function(){
        status = $(this).attr('title');
        id_produto = $(this).attr('id').split('-')[4];
        $.ajax({
            url : '/produtos/tabela-precos-produto/'+id_produto+'/',
            type : "GET",
            data : {verifica_permissoes : 1,},

            success : function(json) {
                if (json.permissoes){
                window.open('/produtos/tabela-precos-produto/'+id_produto+'/');                
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

    $('#precos_tabelados_pdf').on('click', function(event){
        $.ajax({
            url : '/produtos/tabela-precos-pdf/',
            type : "GET",
            data : {verifica_permissoes : 1,},

            success : function(json) {
                if (json.permissoes){
                window.open('/produtos/tabela-precos-pdf/');                
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


    function limpaCampos(){
        $('#id_percentual').val('0.000');
        $('#id_preco_venda').val('0.000');
         $('#id_valor_compra').val('0.000');
        $('#id_id_preco').val('0');
        $('#id_produto').val('');
		$('#id_cliente').val('');
	    $("#id_observacoes_preco").val('');
	    $("#id_codigo_de_barras_produto").val('');
    };

    function salvar(form){
    $.ajax({
        url : "tabelar-preco/",
        type : "POST",
        data : { id : $('#id_id_preco').val(), form : form},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                $("#btn_cancelar_preco").prop("disabled", false);
                mensagemErroOperacao(json)
            }

            else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id_preco').val(json.id);
                $("#form2 :input").prop("disabled", true);
                $("#btn_novo_preco").prop("disabled", false);
                $("#btn_alterar_preco").prop("disabled", false);
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
                    if(parseFloat($('#id_percentual').val()) < 0.001){
                    $('#id_percentual').val(json.percentual_lucro);
                    }
                    if(parseFloat($('#id_preco_venda').val()) < 0.001){
                    $('#id_preco_venda').val(json.preco_venda);
                    }
                    $('#id_produto').prop("disabled", true);
                    $('#id_codigo_de_barras_produto').prop("disabled", true);
                    $('#id_cliente').prop("disabled", true);
                    $('#id_produto').val(json.id);
                    $('#id_codigo_de_barras_produto').val(json.codigo_barras);
                    $("#id_percentual").prop("disabled", false);
                    $("#id_preco_venda").prop("disabled", false);
                    $("#id_observacoes_preco").prop("disabled", false);
                    $("#btn_salvar_preco").prop("disabled", false);
                    valor_compra = parseFloat(json.valor_compra).toFixed(2);
                    percentual_lucro = parseFloat(json.percentual_lucro).toFixed(3);
                    valor_venda = parseFloat(json.preco_venda).toFixed(3);
                    $('#id_valor_compra').val(valor_compra);
                    if(valor_compra == 0){
                    mensagem = 'Não é possível tabelar este produto, pois o mesmo não possui um valor de compra definido...';
                    titulo = 'TABELANDO PREÇOS';
                    $("#form2 :input").prop("disabled", true);
                    $("#id_cliente").prop("disabled", false);
                    $("#id_produto").prop("disabled", false);
                    $("#id_produto").val('');
                    mensagemAlerta(titulo, mensagem);
                    }
                }else if(json.erro){
                $("#form2 :input").prop("disabled", true);
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemErroOperacao(json);
                }else if(json.alerta){
                //$("#form2 :input").prop("disabled", true);
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemAlerta(titulo, mensagem);
                }else if(json.permissao_negada){
                $("#form2 :input").prop("disabled", true);
                mensagemErroOperacao(json);
                }
            },

            error : function(xhr,errmsg,err) {
                $("#form2 :input").prop("disabled", true);
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };

    $("#corpo").on('click', 'a[id^=alterar-preco-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        buscarRegistro(registro_id);
    });

    $("#corpo").on('click', 'a[id^=muda-status_2-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        mudaStatusPrecoTabelado(registro_id)
        });

    $("#corpo").on('click', 'a[id^=muda-status-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        mudaStatusPrecoTabelado(registro_id)
        });

    function mudaStatusPrecoTabelado(registro_id){
        $.ajax({
            url : "/produtos/muda-status-preco-tabelado/",
            type : "POST",
            data : { registro_id : registro_id },
            success : function(json) {
             if(json.sucesso){
                $('#muda-status_2-'+registro_id).html("<span>"+json.status_preco+"</span>");
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

    $("#corpo").on('click', 'a[id^=excluir-preco-tabelado-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        $.ajax({
            url : "/produtos/excluir-preco-tabelado/",
            type : "DELETE",
            data : { registro_id : registro_id },
            success : function(json) {
                if(json.sucesso){
                $('#preco-tabelado-'+registro_id).hide();
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
            url : "/produtos/buscar-preco-tabelado/",
            type : "GET",
            data : { id : registro_id},

            success : function(json){
                //alert(json.mensagem);
                if(json.sucesso){
                    $('.form-group').removeClass('has-error').addClass('has-success');
                    $('#id_id_preco').val(json.id);
                    $("#id_cliente").prop("disabled", true);
                    $("#id_percentual").prop("disabled", false);
                    $("#id_preco_venda").prop("disabled", false);
                    $("#btn_novo_preco").prop("disabled", true);
                    $("#btn_cancelar_preco").prop("disabled", false);
                    $("#id_observacoes_preco").prop("disabled", false);
                    for (var i in json.campos) {
                        $('#'+i).val('');
                        $('#'+i).val(json.campos[i]).val;
                    }
                    id_produto = $("#id_produto").val();
                    codigo_barras = '';
                    buscaProduto(id_produto, codigo_barras);
                    fechaGuias();
                    $('#li-form-tabela-precos').addClass('active');
                    $('#form-tabela-precos').addClass('in active');
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


    function buscarPrecosTabelados(id_produto, id_cliente, codigo_barras){
        $('#tabela_de_precos tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "/produtos/buscar-precos-tabelados/",
            type : "GET",
            data : { id_cliente : id_cliente, id_produto: id_produto, codigo_barras: codigo_barras },
            success : function(json) {
                    $('#tabela-precos').html(
                    '<table id="tabela_de_precos" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                        '<tr style="white-space: nowrap;">'+
                            '<th data-class="expand">ID</th>'+
                            '<th data-hide="phone">Produto</th>'+
                            '<th data-hide="phone">Percentual</th>'+
                            '<th data-hide="phone,tablet">Preco venda</th>'+
                            '<th data-hide="phone,tablet">Cliente</th>'+
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
                    $('#tabela_de_precos').append('<tr  id="preco-tabelado-'+json[i].id+'">'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].produto+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="background-color:black;">'+
                                        '<li class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].descricao_simplificada+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="alterar-preco-'+json[i].id+'">ALTERAR PREÇOO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="muda-status-'+json[i].id+'">MUDAR STÁTUS</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="excluir-preco-tabelado-'+json[i].id+'">EXCLUIR PREÇO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].percentual+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].preco_venda+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].cliente+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div id="registro-'+json[i].id+'">'+
                            '<a style="cursor:pointer;" id="muda-status_2-'+json[i].id+'">'+
                                '<span>'+json[i].status_preco+'</span>'+
                            '</a>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].empresa+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].observacoes_preco+'</td>'+
                    '</tr>'
                    )
                }
                pageSetUp();

                var responsiveHelper_tabela_de_precos = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

                /* COLUMN SHOW - HIDE */
			$('#tabela_de_precos').dataTable({
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
					if (!responsiveHelper_tabela_de_precos) {
						responsiveHelper_tabela_de_precos = new ResponsiveDatatablesHelper($('#tabela_de_precos'), breakpointDefinition);
					}
				},
				"rowCallback" : function(nRow) {
					responsiveHelper_tabela_de_precos.createExpandIcon(nRow);
				},
				"drawCallback" : function(oSettings) {
					responsiveHelper_tabela_de_precos.respond();
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