var estoque_total = 0;
var em_estoque = 0;
var id_produto = 0;
var valor_compra = 0;
var id_entrada = 0;
var quantidade_anterior = 0;
var quantidade_entrada = 0;
var estoque_atual = 0;
var valor_unitario = 0;
var valor_total = 0;
var novo_estoque = 0;
var contagem = 0;
var titulo, mensagem = '';
var codigo_barras = '';
var fracionar_produto = '';
var unidade_medida = '';
var x = 0;
var itens = [];
var atualizar_preco = '';
var atualizar_preco_tabelado = '';

$(function() {
    var status = '';

    $('#id_quantidade').on('blur', function(event){
        if ($('#id_quantidade').val() == ''){
        $('#id_quantidade').val('0.000')
        };
	});
	$('#id_quantidade').on('click', function(event){
        if ($('#id_quantidade').val() < 0.001){
        $('#id_quantidade').val("");
        }
	});

	$('#id_preco_compra').on('blur', function(event){
        if ($('#id_preco_compra').val() == ''){
        $('#id_preco_compra').val('0.000')
        };
	});

    $('#id_preco_compra').on('click', function(event){
        if ($('#id_preco_compra').val() < 0.001){
        $('#id_preco_compra').val("");
        }
	});

	$('#btn_sair_entrada').on('click', function(event){
        $("#form_entrada :input").prop("disabled", true);
        $("#form_entrada :input").val('');
        $("#btn_sair_entrada").prop("disabled", false);
        $('#id_compra').val('');
        fechaGuias();
        $('#li-tb-compras').addClass('active');
        $('#tb-compras').addClass('in active');
	});

	$('#btn_alterar_entrada').on('click', function(event){
	    if (parseInt($('#id_id_entrada').val() < 1)){
	        $("#btn_alterar_entrada").prop("disabled", true);
	        titulo = 'REGISTRO NÃO IDENTIFICADO...';
	        mensagem = 'O sistema não identificou o ítem que você deseja alterar...' ;
	        mensagemAlerta(titulo, mensagem);
	    }else{
            habilitaCamposFormEntrada();
            $("#btn_registrar_entrada").prop("disabled", false);
            $("#btn_alterar_entrada").prop("disabled", true);
            $("#id_produto").prop("disabled", true);
            $("#id_codigo_barras").prop("disabled", true);
            quantidade_anterior = parseFloat($("#id_quantidade").val())
            $("#id_quantidade").focus();
            $("#btn_alterar_entrada").prop("disabled", true);
            codigo_barras ='';
            id_produto = 0;
            id_compra = 0;
            id_entrada = parseInt($('#id_id_entrada').val());
            buscaProduto(codigo_barras, id_produto, id_entrada, id_compra);
	    }
	});

	$('#btn_cancelar_entrada').on('click', function(event){
	    $("#form_entrada :input").prop("disabled", true);
        limpaCamposFormEntrada();
        $("#id_produto").val('');
        $("#btn_sair_entrada").prop("disabled", false);
        $("#btn_nova_entrada").prop("disabled", false);
	});

	$('#btn_nova_entrada').on('click', function(event){
        if ($("#id_compra").val() != ''){
            limpaCamposFormEntrada();
            $("#id_codigo_barras").prop("disabled", false);
            $("#id_produto").prop("disabled", false);
            $("#btn_cancelar_entrada").prop("disabled", false);
            $('#id_codigo_barras').focus();
            $("#btn_nova_entrada").prop("disabled", true);
        }else{
        fechaGuias();
        $('#li-tb-compras').addClass('active');
        $('#tb-compras').addClass('in active');
        titulo = 'SELECIONE UMA COMPRA...';
        mensagem = 'Para adicionar um produto, você deve escolher esta opção clicando em uma compra...'
        mensagemInfo(titulo,mensagem);
        }

	});

    $('#form_entrada').on('submit', function(event){
        event.preventDefault();
        $("#form_entrada :input").prop("disabled", false);
        var form_entrada = $('#form_entrada').serialize(true);
        registrar_entrada(form_entrada);
        $("#form_entrada :input").prop("disabled", true);
        habilitaCamposFormEntrada();
    });

    $("#corpo").on('click', 'a[id^=adicionar-produto-compra-]', function(){
        id_compra = $(this).attr('id').split('-')[3];
        status = $(this).attr('title');
        if (status != 'NAO LANCADO' && status != 'PARCIALMENTE LANCADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Não é possível adicionar produtos a esta compra, pois a mesma já foi concluída... ';
            mensagemInfo(titulo,mensagem);
        }else{
        limpaCamposFormEntrada();
        $("#id_compra").val(id_compra);
        $("#id_codigo_barras").prop("disabled", false);
        $("#id_produto").prop("disabled", false);
        fechaGuias();
        $('#li-form-entrada-produtos').addClass('in active');
        $('#form-entrada-produtos').addClass('in active');
        }
    });

    $('#id_codigo_barras').on('change', function(event){
        $("#btn_registrar_entrada").prop("disabled", true);
		codigo_barras = $(event.target).val();
		id_produto = 0;
		id_entrada = 0;
		id_compra = 0;
        if (codigo_barras != ''){
         buscaProduto(codigo_barras, id_produto, id_entrada, id_compra);
        }
	});

	$('#id_produto').on('change', function(event){
	    $("#btn_registrar_entrada").prop("disabled", true);
		id_produto = parseInt($(event.target).val());
		codigo_barras = '';
		id_entrada = 0;
		id_compra = 0;
        if (id_produto > 0){
            buscaProduto(codigo_barras, id_produto, id_entrada, id_compra);
        }
	});


	$('#id_preco_compra').on('change', function(event){
	    $("#btn_registrar_entrada").prop("disabled", true);
		if($("#id_preco_compra").val() != ''){
		    quantidade = parseFloat($("#id_quantidade").val());
		    valor_compra = parseFloat($(event.target).val());
		}else{
            titulo = 'VALOR INVÁLIDO...'
            mensagem = 'Você está vendo esta menságem, porque deixou o preço compra em branco, ou o sistema rejeitou '+
            'a virgulas na separação de casas decimais. Informe opreço de compra do produto trocando a virgula por um ponto...';
            $("#id_preco_compra").val('0');
            $("#id_preco_compra").focus();
            mensagemAlerta(titulo, mensagem);
        }
		$("#id_preco_compra").val(parseFloat($("#id_preco_compra").val()).toFixed(3));
		calcularCompra();
	});


	$('#id_quantidade').on('change', function(event){
        $("#btn_registrar_entrada").prop("disabled", true);
	    if($("#id_quantidade").val() != ''){
		    quantidade = parseFloat($("#id_quantidade").val());
            if (quantidade > 0){
                if((quantidade % 1 > 0 && fracionar_produto == 'SIM') || (quantidade % 1 == 0 && fracionar_produto == 'NAO') || (quantidade % 1 == 0 && fracionar_produto == 'SIM')){
                    if(id_entrada > 0){
                        estoque_total = (estoque_atual - quantidade_anterior + quantidade)
                    }
                    if(estoque_total < 0){
                        $("#id_quantidade").val(parseFloat(quantidade_anterior).toFixed(3));
                        mensagem = 'Parte desre produto já foi vendido. Não será possível fazer eta alteração. Tente uma quantidade maior...';
                        mensagemAlerta('QUANTIDADE INVÁLIDA...', mensagem);
                        $('#id_quantidade').focus();
                    }
                }else{
                    titulo = 'QUANTIDADE INVÁLIDA...'
                    mensagem = 'Este produto não pode ser fracionado, deve ser vendido sempre o(a) '
                    +unidade_medida+' completo(a)....'
                    $("#id_quantidade").val('0');
                     $('#id_quantidade').focus();
                    $("#btn_registrar_entrada").prop("disabled", true);
                    mensagemAlerta(titulo, mensagem);
                }
            }else{
                mensagemAlerta('QUANTIDADE INVÁLIDA...', 'Informe uma quantidade válida...');
                $("#id_quantidade").val('0');
                $('#id_quantidade').focus();
            }
        }else{
            titulo = 'QUANTIDADE INVÁLIDA...'
            mensagem = 'Você está vendo esta menságem, porque deixou a quantidade em branco, ou o sistema rejeitou '+
            'a virgula na separação de casas decimais. Informe a quantidade ou troque a virgula por um ponto...';
            $("#id_quantidade").val('0');
            $("#id_quantidade").focus();
            mensagemAlerta(titulo, mensagem);
            $('#id_quantidade').val("0.00");
            $("#btn_registrar_entrada").prop("disabled", true);
        }
        $("#id_quantidade").val(parseFloat($("#id_quantidade").val()).toFixed(3));
        calcularCompra();
	});


    function calcularCompra(){
        quantidade = parseFloat($("#id_quantidade").val());
        preco_compra = parseFloat($("#id_preco_compra").val());
        valor_total = (quantidade * preco_compra);
        $("#id_total").val(parseFloat(valor_total).toFixed(2));
        if(valor_total > 0){
            $("#btn_registrar_entrada").prop("disabled", false);
        }
    };

    function registrar_entrada(form_entrada){
        if(quantidade > 0.01){
            $.ajax({
                url : "registrar-entrada-produto/",
                type : "POST",
                data : { form_entrada : form_entrada,
                         quantidade : quantidade,
                         atualizar_preco : $('#atualizar_preco').val(),
                         atualizar_preco_tabelado : $('#atualizar_preco_tabelado').val(),
                         entrada_id : $('#id_id_entrada').val()
                       },

                success : function(json) {
                    if (json.erro){
                        $("#btn_registrar_entrada").prop("disabled", false);
                        $('.form-group').removeClass('has-error');
                        for (var i=0; i< json.erro.length; i++){
                            $('#div_'+json.erro[i]).addClass('has-error');
                        }
                        mensagemErroOperacao(json)
                    }
                    else if(json.sucesso){
                        $('.form-group').removeClass('has-error').addClass('has-success');
                        $('#id_id_entrada').val(json.id);
                        $("#form_entrada :input").prop("disabled", true);
                        $("#btn_alterar_entrada").prop("disabled", false);
                        $("#btn_nova_entrada").prop("disabled", false);
                        $("#btn_sair_entrada").prop("disabled", false);
                        id_entrada = 0;
                        codigo_barras = '';
                        id_produto = 0;
                        itens = json.itens;
                        mensagemSucesso(json);
                        itensCompra(json);
                    }else if(json.alerta){
                        titulo = json.titulo;
                        mensagem = json.mensagem;
                        mensagemAlerta(titulo, mensagem);
                    }else if(json.erro2){
                        mensagemErroOperacao(json);
                    }
                },

                error : function(xhr,errmsg,err) {
                    mensagemErroSistema()
                    console.log(xhr.status + ": " + xhr.responseText);
                }
            });
        }else{
            $("#btn_registrar_entrada").prop("disabled", true);
            mensagemAlerta('QUANTIDADE INVÁLIDA...', 'Informe uma quantidade válida...');
            $("#id_quantidade").val('0');
            $('#id_quantidade').focus();
        }
    };

    $("#corpo").on('click', 'a[id^=alterar-item-]', function(){
        status = $(this).attr('title');
        if (status == 'CANCELADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem não pode ser alterado, pois o mesmo encontra-se: "CANCELADO"...';
            mensagemInfo(titulo,mensagem);
        }else{
             id_entrada = $(this).attr('id').split('-')[2];
             $("#btn_sair_entrada").prop("disabled", false);
             $("#btn_cancelar_entrada").prop("disabled", false);
             $("#btn_nova_entrada").prop("disabled", true);
             codigo_barras = '';
             id_produto = 0;
             id_compra = 0;
            buscaProduto(codigo_barras, id_produto, id_entrada, id_compra);
         }
    });

    $("#corpo").on('click', 'a[id^=item-cancelado-]', function(){
        status = $(this).attr('title');
        if (status == 'CANCELADO'){
            titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...';
            mensagem = 'Este ítem já encontra-se cancelado...';
            mensagemInfo(titulo,mensagem);
        }else{
            id_entrada = $(this).attr('id').split('-')[2];
            cancelarItem(id_entrada)
        }
    });

    function cancelarItem(id_entrada) {
        $.ajax({
            url : "/compras/cancelar-entrada-produto/",
            type : "POST",
            data : { id_entrada : id_entrada },
            success : function(json) {
                if (json.sucesso){
                    $('#muda-status-item-'+id_entrada).html("<span>"+json.status+"</span>");
                    $('#linha-'+id_entrada).addClass('danger');
                    mensagemSucesso(json)
                }
                else if (json.erro){
                    mensagemErroOperacao(json)
                }else if (json.info){
                alert(json.status_entrada);
                    mensagemInfo(json.titulo, json.mensagem)
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };


    // This function gets cookie with a given name
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    /*
    The functions below will create a header with csrftoken
    */

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});
    function itensCompra(json){
        $('#tabela-itens tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $('#informativo_compra').html("<span>000"+json.id+" -"+json.fornecedor+" ( <strong>$ "+parseFloat(json.valor_total).toFixed(2)+"</strong> )</span>");
        $('#info_compra').html("<h6>Data: <strong> "+json.data_compra+"</strong></h6>"+
        "<h6>Comprador: <strong> "+json.solicitante+"</strong></h6>"+
        "<h6>Státus: <strong> "+json.status_compra+"</strong></h6>"+
        "<h2>Valor total: <strong>$ "+parseFloat(json.valor_total).toFixed(2)+"</strong></h2>");
        $('#datatable_tabletools').hide();
        $('#tabela-itens').html(
                    '<table id="datatable_tabletools" class="table table-bordered table-hover" style="white-space: nowrap;" width="100%">'+
                    '<thead>'+
                        '<tr style="white-space: nowrap;">'+
                        '<th data-class="expand">ID</th>'+
                        '<th> Descricao do produto</th>'+
                        '<th data-hide="phone,tablet"> Quantidade</th>'+
                        '<th data-hide="phone,tablet"> Valor unit</th>'+
                        '<th data-hide="phone,tablet"> Valor total</th>'+
                        '<th data-hide="phone,tablet">Data</th>'+
                        '<th data-hide="phone,tablet">Fabricacao</th>'+
                        '<th data-hide="phone,tablet">Validade</th>'+
                        '<th data-hide="phone,tablet">Lote</th>'+
                        '<th data-hide="phone,tablet">Marca</th>'+
                        '<th data-hide="phone,tablet">Státus</th>'+
                        '<th data-hide="phone,tablet">Empresa</th>'+
                        '<th data-hide="phone,tablet">Oservações</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                '</tbody>'+
                '</table>'
                    )
                    itens = json.itens;
                for(var i=0;itens.length>i;i++){
                    $('#datatable_tabletools').append('<tr id="linha-'+itens[i].id+'">'+
                    '<td class="'+itens[i].classe+'">'+itens[i].id+'</td>'+
                    '<td class="'+itens[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+itens[i].produto+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-registro-'+itens[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">ÌTEM 000'+itens[i].id+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" title="'+itens[i].status_entrada+'" id="alterar-item-'+itens[i].id+'">ALTERAR ÍTEM</a>'+
                                         '</li>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" title="'+itens[i].status_entrada+'" id="item-cancelado-'+itens[i].id+'">CANCELAR ÍTEM</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].quantidade+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].preco_compra+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].total+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].data_entrada+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].data_fabricacao+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].data_validade+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].numero_lote+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].marca+'</td>'+
                    '<td class="'+itens[i].classe+'" style="white-space: nowrap;">'+
                        '<div id="registro-'+itens[i].id+'">'+
                            '<a style="cursor:pointer;" id="muda-status-item-'+itens[i].id+'">'+
                                '<span>'+itens[i].status_entrada+'</span>'+
                            '</a>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].empresa+'</td>'+
                    '<td class="'+itens[i].classe+'">'+itens[i].observacoes_entrada+'</td>'+
                    '</tr>'
                    )
                }
                pageSetUp();
                var responsiveHelper_datatable_tabletools = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

             /* TABLETOOLS */
			$('#datatable_tabletools').dataTable({

				// Tabletools options:
				//   https://datatables.net/extensions/tabletools/button_options
				"sDom": "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-6 hidden-xs'T>r>"+
						"t"+
						"<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-sm-6 col-xs-12'p>>",
				"oLanguage": {
					"sSearch": '<span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>'
				},
		        "oTableTools": {
		        	 "aButtons": [
		             "copy",
		             "csv",
		             "xls",
		                {
		                    "sExtends": "pdf",
		                    "sTitle": "SmartAdmin_PDF",
		                    "sPdfMessage": "SmartAdmin PDF Export",
		                    "sPdfSize": "letter"
		                },
		             	{
	                    	"sExtends": "print",
	                    	"sMessage": "Generated by SmartAdmin <i>(press Esc to close)</i>"
	                	}
		             ],
		            "sSwfPath": "/static/js/plugin/datatables/swf/copy_csv_xls_pdf.swf/"
		        },
				"autoWidth" : true,
				"scrollX": true,
                //"scrollY":"400px",
                scrollY:        '50vh',
                //"scrollCollapse": true,
                //"paging": false,
                "stateSave": true,

				"preDrawCallback" : function() {
					// Initialize the responsive datatables helper once.
					if (!responsiveHelper_datatable_tabletools) {
						responsiveHelper_datatable_tabletools = new ResponsiveDatatablesHelper($('#datatable_tabletools'), breakpointDefinition);
					}
				},
				"rowCallback" : function(nRow) {
					responsiveHelper_datatable_tabletools.createExpandIcon(nRow);
				},
				"drawCallback" : function(oSettings) {
					responsiveHelper_datatable_tabletools.respond();
				}
			});

			/* END TABLETOOLS */
    };


function buscaProduto(codigo_barras, id_produto, id_entrada, id_compra){
        $.ajax({
            url : "buscar-produto/",
            type : "GET",
            data : { codigo_barras : codigo_barras,
                    id_produto : id_produto,
                    id_entrada : id_entrada,
                    id_compra : $("#id_compra").val() },

            success : function(json) {
                if (json.sucesso){
                    $('.form-group').removeClass('has-error').removeClass('has-success');
                    $("#btn_cancelar_entrada").prop("disabled", false);
                    habilitaCamposFormEntrada();
                    limpaCamposFormEntrada();
                    estoque_atual = parseFloat(json.estoque_atual);
                    valor_compra = parseFloat(json.valor_compra);
                    fracionar_produto = json.fracionar_produto;
                    unidade_medida = json.unidade_medida;
                    $('#id_produto').val(json.id);
                    $('#id_preco_compra').val(json.valor_compra);
                    $('#id_codigo_barras').val(json.codigo_barras);
                    $('#id_marca').val(json.marca);
                    $('#id_quantidade').focus();
                }else if(json.erro){
                    titulo = json.titulo;
                    mensagem = json.mensagem;
                    mensagemErroOperacao(json);
                    //limpaCamposFormEntrada();
                }else if(json.alerta){
                    titulo = json.titulo;
                    mensagem = json.mensagem;
                    mensagemAlerta(titulo, mensagem);
                    //limpaCamposFormEntrada();
                }else if(json.permissao_negada){
                    mensagemErroOperacao(json);
                }
                if(parseInt(json.id_entrada) > 0){
                    $('#id_id_entrada').val(json.id_entrada);
                    for (var i in json.campos) {
                        $('#'+i).val(json.campos[i]).val;
                    }
                    fechaGuias();
                    $('#li-form-entrada-produtos').addClass('in active');
                    $('#form-entrada-produtos').addClass('in active');
                }
            },

            error : function(xhr,errmsg,err) {
                limpaCamposFormEntrada();
                $("#form_entrada :input").prop("disabled", true);
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };

function limpaCamposFormEntrada(){
        $("#form_entrada input").val('');
        $('#id_quantidade').val("0.000");
		$('#id_preco_compra').val("0.000");
		$('#id_total').val("0.00");
		$('#id_id_entrada').val("0");
		$('#id_codigo_barras').val("");
		$('#id_produto').val("");
		$('#atualizar_preco_tabelado').val("");
		$('#atualizar_preco').val("");
		$('#id_observacoes_entrada').val('');
		$('.form-group').removeClass('has-error').removeClass('has-success');
};

function habilitaCamposFormEntrada(){
    $("#form_entrada input").prop("disabled", false);
    $("#form_entrada select").prop("disabled", false);
    $("#id_observacoes_entrada").prop("disabled", false);
    $("#id_compra").prop("disabled", true);
    $("#id_id_entrada").prop("disabled", true);
    $("#id_total").prop("disabled", true);
    $("#id_produto").prop("disabled", true);
    $("#id_codigo_barras").prop("disabled", true);
    $("#id_marca").prop("disabled", true);
};

