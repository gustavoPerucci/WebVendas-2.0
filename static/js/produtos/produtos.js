$(function() {
    var delete_row;
    var status = '';
    var descricao = '';
    var registro_id = 0;
    var codigo_barras = '';
    var id_produto = 0;

    $('#form').on('submit', function(event){
        event.preventDefault();
        var form = $('#form').serialize(true);
        salvar(form);
    });

    $('#formPesquisaProdutosCodigoBarras').on('submit', function(event){
        event.preventDefault();
        descricao = '';
        status = '';
        id_produto = '';
        codigo_barras = $('#codigo_barras').val();
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        buscarProdutos(status, descricao, id_produto, codigo_barras);
    });

    $('#formPesquisaProdutosDescricao').on('submit', function(event){
        event.preventDefault();
        codigo_barras = '';
        status = '';
        id_produto = '';
        descricao = $('#descricao_produto').val();
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        buscarProdutos(status, descricao, id_produto, codigo_barras);
    });

    $('#formPesquisaProdutosID').on('submit', function(event){
        event.preventDefault();
        codigo_barras = '';
        descricao = '';
        status = '';
        id_produto = $('#codigo_produto').val();
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        buscarProdutos(status, descricao, id_produto, codigo_barras);
    });

    $('#id_id').on('blur', function(event){
        if ($('#id_id').val() == ''){
        $('#id_id').val('0')
        };
	});

    $("#corpo").on('click', 'a[id^=anunciar-produto-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        anunciar(registro_id);
    });

    $("#corpo").on('click', 'a[id^=anunciar-1-produto-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        anunciar(registro_id);
    });

    $("#corpo").on('click', 'a[id^=ativar-registro-]', function(){
         registro_id = $(this).attr('id').split('-')[2];
         status = 'ATIVO';
         mudaStatusProduto(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=ativar-1-registro-]', function(){
         registro_id = $(this).attr('id').split('-')[3];
         status = 'ATIVO';
         mudaStatusProduto(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-registro-]', function(){
         registro_id = $(this).attr('id').split('-')[2];
         status = 'EXCLUIDO';
         mudaStatusProduto(registro_id, status)
    });

     $("#corpo").on('click', 'a[id^=excluir-1-registro-]', function(){
         registro_id = $(this).attr('id').split('-')[3];
         status = 'EXCLUIDO';
         mudaStatusProduto(registro_id, status, codigo_barras, id_produto)
    });

    $("#corpo").on('click', 'a[id^=fora-registro-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'FORA DE LINHA';
        mudaStatusProduto(registro_id, status, codigo_barras, id_produto)
    });

    $("#corpo").on('click', 'a[id^=fora-1-registro-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'FORA DE LINHA';
        mudaStatusProduto(registro_id, status, codigo_barras, id_produto)
    });

    $("#corpo").on('click', 'a[id^=desativar-registro-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'INATIVO';
        mudaStatusProduto(registro_id, status, codigo_barras, id_produto)
    });

    $("#corpo").on('click', 'a[id^=desativar-1-registro-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'INATIVO';
        mudaStatusProduto(registro_id, status, codigo_barras, id_produto)
    });

    $("#corpo").on('click', 'a[id^=buscar-produto-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        buscarRegistro(registro_id)
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        registro_id = $('#id_Pesquisa').val();
        buscarRegistro(registro_id)

    });

    $("#produtos_ativos").on('click', function(){
        event.preventDefault();
        status = $(this).attr('title');
        codigo_barras = '';
        descricao = '';
        id_produto ='';
        buscarProdutos(status, descricao, id_produto, codigo_barras);
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        $('#pesquisa').removeClass('active');
        $(this).addClass('active');
    });

    $("#produtos_inativos").on('click', function(){
        event.preventDefault();
        status = $(this).attr('title');
        codigo_barras = '';
        descricao = '';
        id_produto ='';
        buscarProdutos(status, descricao, id_produto, codigo_barras);
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        $('#pesquisa').removeClass('active');
        $(this).addClass('active');
    });

    $("#produtos_fora_de_linha").on('click', function(){
        event.preventDefault();
        codigo_barras = '';
        descricao = '';
        id_produto ='';
        status = $(this).attr('title');
        buscarProdutos(status, descricao, id_produto, codigo_barras)
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        $('#pesquisa').removeClass('active');
        $(this).addClass('active');
    });

    $("#produtos_excluidos").on('click', function(){
        event.preventDefault();
        codigo_barras = '';
        descricao = '';
        id_produto ='';
        status = $(this).attr('title');
        buscarProdutos(status, descricao, id_produto, codigo_barras)
        $('#produtos_ativos').removeClass('active');
        $('#produtos_inativos').removeClass('active');
        $('#produtos_fora_de_linha').removeClass('active');
        $('#produtos_excluidos').removeClass('active');
        $('#produtos_novo').removeClass('active');
        $(this).addClass('active');
    });


    function salvar(form) {
    $.ajax({
        url : "/produtos/cadastrar-produto/",
        type : "POST",
        data : { id : $('#id_id').val(), form : form},
        success : function(json){
            if (json.erro){
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json);
            }
            else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id').val(json.id);
                $("#form :input").prop("disabled", true);
                $("#formPesquisa :input").prop("disabled", false);
                mensagemSucesso(json);
            }
        },
        error : function(xhr,errmsg,err) {
            mensagemErroSistema();
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};


    function mudaStatusProduto(registro_id, status) {
        $.ajax({
            url : "/produtos/muda-status-produto/",
            type : "POST",
            data : { registro_id : registro_id, status : status },
            success : function(json) {
               if(json.sucesso){
                    $('#status-registro-'+registro_id).html("<span>"+json.status+"</span>");
                    $('#status-li-registro-'+registro_id).html("<span>"+json.status+"</span>");
                    $('#anunciar-produto-'+registro_id).html("<span>"+json.anuncio+"</span>");
                    $('#anunciar-1-produto-'+registro_id).html("<span>"+json.anuncio+"</span>");
                   mensagemSucesso(json);
               }else if(json.permissao_negada){
                    mensagemErroOperacao(json);
               }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema();
            },
        });
    };

    function anunciar(registro_id){
        $.ajax({
            url : "/produtos/anunciar-produto/", // the endpoint
            type : "POST", // http method
            data : { registro_id : registro_id },
            success : function(json){
                if(json.sucesso){
                    $('#anunciar-produto-'+registro_id).html(
                    "<span>"+json.anuncio+"</span>");
                    $('#anunciar-1-produto-'+registro_id).html(
                    "<span>"+json.anuncio+"</span>");
                    mensagemSucesso(json);
                }else if(json.permissao_negada){
                    mensagemErroOperacao(json);
                }
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema();
            },
        });
    };

    function buscarRegistro(registro_id) {
        $.ajax({
            url : "/produtos/buscar-produto/",
            type : "GET",
            data : { id : registro_id},
            success : function(json) {
                if(json.sucesso){
                    $('.form-group').removeClass('has-error').addClass('has-success');
                    $('#id_id').val(json.id);
                    for (var i in json.campos) {
                        $('#'+i).val('');
                        $('#'+i).val(json.campos[i]).val;
                        console.log(json.campos)
                    }
                }else if(json.permissao_negada){
                    $("#form :input").prop("disabled", true);
                    $("#modalcadastroprodutos").hide();
                    mensagemErroOperacao(json);
                }
            },
            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };


    function buscarProdutos(status, descricao, id_produto, codigo_barras) {
        $('#tb_registros tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "/produtos/buscar-produtos/",
            type : "GET",
            data : { status : status, descricao: descricao, codigo_barras: codigo_barras, id_produto: id_produto },
            success : function(json){
                    $('#tabelaprodutos').html(
                    '<table id="tb_registros" class="table table-bordered table-hover" width="100%">'+
                    '<thead>'+
                    '<tr style="white-space: nowrap;">'+
                        '<th data-class="expand">ID</th>'+
                        '<th>Descrição</th>'+
                        '<th data-hide="phone,tablet">Estoque</th>'+
                        '<th data-hide="phone,tablet">Preço compra</th>'+
                        '<th data-hide="phone,tablet">Lucros</th>'+
                        '<th data-hide="phone,tablet">Preço venda</th>'+
                        '<th data-hide="phone,tablet">Estoque total $</th>'+
                        '<th data-hide="phone,tablet">desconto total $</th>'+
                        '<th data-hide="phone,tablet">Volor estoque $</th>'+
                        '<th data-hide="phone,tablet">Desc. varejo</th>'+
                        '<th data-hide="phone,tablet">Desc. atac</th>'+
                        '<th data-hide="phone,tablet">Atacado</th>'+
                        '<th data-hide="phone,tablet">Anunciar</th>'+
                         '<th data-hide="phone,tablet">Státus</th>'+
                        '<th data-hide="phone,tablet">Código barras</th>'+
                        '<th data-hide="phone,tablet">Empresa</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody class=" animated fadeInDown"style="white-space: nowrap;">'+
                '</tbody">'+
                '</table>'

                    )
                    var registro = json.produtos;
                for(var i=0;registro.length>i;i++){
                    $('#tb_registros').append('<tr>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].id+'</td>'+
                    '<td class="'+registro[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+registro[i].descricao_simplificada+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-registro-'+registro[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+registro[i].descricao_simplificada+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="buscar-produto-'+registro[i].id+'">EDITAR REGISTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="anunciar-1-produto-'+registro[i].id+'"><span>'+registro[i].anunciar_produto+'</span></a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-ativar-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-1-registro-'+registro[i].id+'">ATIVAR PRODUTO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-desativar-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-1-registro-'+registro[i].id+'">DESATIVAR PRODUTO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-fora-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="fora-1-registro-'+registro[i].id+'">POR FORA DE LINHA</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-excluir-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-1-registro-'+registro[i].id+'">EXCLUIR PRODUTO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="buscar-tabela-preco-produto-'+registro[i].id+'">TABELA DE PREÇOS</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="buscar-preco-promocao-produto-'+registro[i].id+'">REGISTRO DE PROMÇÕES</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].estoque_atual+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].valor_compra+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].percentual_lucro+' %</td>'+
                     '<td class="'+registro[i].classe+'">'+registro[i].preco_venda+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].valor_total+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].tatal_desconto+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].valor_estoque+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].desconto_maximo+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].atacado_desconto+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].atacado_apartir+'</td>'+
                    '<td class="'+registro[i].classe+'">'+
                        '<div id="registro-'+registro[i].id+'">'+
                            '<a style="cursor:pointer;" id="anunciar-produto-'+registro[i].id+'">'+
                                '<span>'+registro[i].anunciar_produto+'</span>'+
                            '</a>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+registro[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-registro-'+registro[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+registro[i].status+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-registro-'+registro[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+registro[i].status+'</li>'+
                                        '<li class="divider"></li>'+
                                         '<li id="li-ativar-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-registro-'+registro[i].id+'">ATIVAR PRODUTO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li id="li-desativar-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-registro-'+registro[i].id+'">DESATIVAR PRODUTO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li id="li-fora-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="fora-registro-'+registro[i].id+'">POR FORA DE LINHA</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                         '<li id="li-excluir-'+registro[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-registro-'+registro[i].id+'">EXCLUIR PRODUTO</a>'+
                                         '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].codigo_barras+'</td>'+
                    '<td class="'+registro[i].classe+'">'+registro[i].empresa+'</td>'+
                    '</tr>')
                }

                if(json.mensagem && json.sucesso){
                    mensagemInfo(json.titulo, json.mensagem);
                }else if(json.mensagem && json.alerta){
                    mensagemAlerta(json.titulo, json.mensagem);
                }if(json.mensagem && json.erro){
                    mensagemErroOperacao(json.titulo, json.mensagem);
                }
                fechaGuias()
                $('#li-tb-produtos').addClass('active');
                $('#tb-produtos').addClass('in active');

                pageSetUp();

                /* BASIC ;*/
				var responsiveHelper_tb_registros = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };



				$('#tb_registros').dataTable({
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



            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    };

    // CATEGORIAS

    $("#nova_categoria").on('click', function(){
       $('#id_categoria').val('0');
       $('#id_descricao').val('');
       $('#id_obs').val('');
       $('.collapse').removeClass('collapsed').addClass('in');
    });

     var table_categorias =  $('#table-categorias').DataTable({
            "responsive": true,
            "autoWidth" : true,
            "scrollX": true,
     });

     // um clique seleciona a linha na tabela, dois cliques abre exibe o formulario para edicao.
     $('#table-categorias tbody').on( 'click', 'td', function(){
        table_categorias.$('tr.selected').removeClass('selected bg-color-yellow');
        $(this).closest("tr").toggleClass('selected bg-color-yellow');
     })
     .on( 'dblclick', 'tr', function(){
        $('#id_categoria').val(table_categorias.row(this).data()[0]);
        $('#id_descricao').val(table_categorias.row(this).data()[1]);
        $('#id_obs').val(table_categorias.row(this).data()[2]);
        $('.collapse').removeClass('collapsed').addClass('in');
        $(".modal-body").animate({ scrollTop: 0 }, 600);
     });


    $("#salvar_categoria").on('click', function(){
           event.preventDefault();
           var form = $('#form-categorias').serialize(true);

           $.ajax({
                url : "/produtos/categorias/",
                type : "POST",
                data : { id : $('#id_categoria').val(), form : form},
                success : function(json){
                    if (json.erro){
                        $('.form-group').removeClass('has-error');
                        for (var i=0; i< json.erro.length; i++){
                            $('#div_'+json.erro[i]).addClass('has-error');
                        }
                        mensagemErroOperacao(json);
                    }else if(json.success){
                        $('.form-group').removeClass('has-error').addClass('has-success');
                        $('#id_categoria').val('0');
                        $('#id_descricao').val('');
                        $('#id_obs').val('');
                        $('.collapse').removeClass('in').addClass('collapsed');
                        table_categorias.row.add([
                                json.id,
                                json.descricao,
                                json.obs,
                            ]).draw();
                        mensagemSucesso(json);
                    }
                },
                error : function(xhr,errmsg,err) {
                    mensagemErroSistema();
                    console.log(xhr.status + ": " + xhr.responseText);
                }
            });
    });

    // MARCAS

    $("#nova_marca").on('click', function(){
       $('#id_marca').val('0');
       $('#id_descricao_marca').val('');
       $('#id_obs_marca').val('');
       $('.collapse').removeClass('collapsed').addClass('in');
    });

     var table_marcas =  $('#table-marcas').DataTable({
            "responsive": true,
            "autoWidth" : true,
            "scrollX": true,
     });

     // um clique seleciona a linha na tabela, dois cliques abre exibe o formulario para edicao.
     $('#table-marcas tbody').on( 'click', 'td', function(){
        table_marcas.$('tr.selected').removeClass('selected bg-color-yellow');
        $(this).closest("tr").toggleClass('selected bg-color-yellow');
     })
     .on( 'dblclick', 'tr', function(){
        $('#id_marca').val(table_marcas.row(this).data()[0]);
        $('#id_descricao_marca').val(table_marcas.row(this).data()[1]);
        $('#id_obs_marca').val(table_marcas.row(this).data()[2]);
        $('.collapse').removeClass('collapsed').addClass('in');
        $(".modal-body").animate({ scrollTop: 0 }, 600);
     });


    $("#salvar_marca").on('click', function(){
           event.preventDefault();
           var form = $('#form-marcas').serialize(true);

           $.ajax({
                url : "/produtos/marcas/",
                type : "POST",
                data : { id : $('#id_marca').val(), form : form},
                success : function(json){
                    if (json.erro){
                        $('.form-group').removeClass('has-error');
                        for (var i=0; i< json.erro.length; i++){
                            $('#div_'+json.erro[i] + '_marca').addClass('has-error');
                        }
                        mensagemErroOperacao(json);
                    }else if(json.success){
                        $('.form-group').removeClass('has-error').addClass('has-success');
                        $('#id_marca').val('0');
                        $('#id_descricao_marca').val('');
                        $('#id_obs_marca').val('');
                        $('.collapse').removeClass('in').addClass('collapsed');
                        table_marcas.row.add([
                                json.id,
                                json.descricao,
                                json.obs,
                            ]).draw();
                        mensagemSucesso(json);
                    }
                },
                error : function(xhr,errmsg,err) {
                    mensagemErroSistema();
                    console.log(xhr.status + ": " + xhr.responseText);
                }
            });
    });
});

function fechaGuias(){
    $('#li-tb-produtos').removeClass('active');
    $('#tb-produtos').removeClass('in active');
    $('#li-tb-precos').removeClass('active');
    $('#tb-precos').removeClass('in active');
    $('#form-tabela-precos').removeClass('in active');
    $('#li-form-tabela-precos').removeClass('active');
    $('#form-precos-promocao').removeClass('in active');
    $('#li-form-precos-promocao').removeClass('active');
    $('#li-tb-precos-promocao').removeClass('active');
    $('#tb-precos-promocao').removeClass('in active');
};