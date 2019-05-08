$(function() {

    var status = '';
    var descricao = '';
    var registro_id = 0;
    var id_permissao = 0;
    var permissao_id = 0;

    $('#formPermissoes').on('submit', function(event){
        event.preventDefault();
        var form = $('#formPermissoes').serialize(true);
        salvar(form);
    });

    $('#formPesquisaPermissoes').on('submit', function(event){
        event.preventDefault();
        registro_id = $('#id_permissao').val();
        buscarRegistro(registro_id);
    });

    $("#corpo").on('click', 'a[id^=buscar-permissao-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        buscarRegistro(registro_id);
        fechaGuiasUsuarios();
        $('#form-permissoes').addClass('in active');
        $('#li-form-permissoes').addClass('active');
    });

    $("#corpo").on('click', 'a[id^=ativar-permissao-]', function(){
        permissao_id = $(this).attr('id').split('-')[2];
        status = 'ATIVO';
        mudaStatusPermissoesUsuario(permissao_id, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-permissao-]', function(){
        permissao_id = $(this).attr('id').split('-')[2];
        status = 'INATIVO';
        mudaStatusPermissoesUsuario(permissao_id, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-permissao-]', function(){
        permissao_id = $(this).attr('id').split('-')[2];
        status = 'EXCLUIDO';
        mudaStatusPermissoesUsuario(permissao_id, status)
    });

    $("#corpo").on('click', 'a[id^=ativar-1-permissao-]', function(){
        permissao_id = $(this).attr('id').split('-')[3];
        status = 'ATIVO';
        mudaStatusPermissoesUsuario(permissao_id, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-1-permissao-]', function(){
        permissao_id = $(this).attr('id').split('-')[3];
        status = 'INATIVO';
        mudaStatusPermissoesUsuario(permissao_id, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-1-permissao-]', function(){
        permissao_id = $(this).attr('id').split('-')[3];
        status = 'EXCLUIDO';
        mudaStatusPermissoesUsuario(permissao_id, status)
    });


    $('#btn_nova_permissao').on('click', function(event){
        event.preventDefault();
        $("#formPermissoes :input").val("");
        $("#formPermissoes select").val("0");
        $("#formPermissoes :input").prop("disabled", false);
        $("#formPesquisaPermissoes :input").prop("disabled", true);
        $("#btn_nova_permissao").prop("disabled", true);
        $("#btn_alterar_permissao").prop("disabled", true);
        $("#id_id_permissao").prop("disabled", true);
        $("#id_id_permissao").val("0");
        $("#id_descricao").focus();
        removeClassMenu()
        $('#permissoes_nova').addClass('active');
        $('#permissoes').addClass('active');
    });

     $('#permissoes_nova').on('click', function(event){
        event.preventDefault();
        $("#formPermissoes :input").val("");
        $("#formPermissoes select").val("0");
        $("#formPermissoes :input").prop("disabled", false);
        $("#formPesquisaPermissoes :input").prop("disabled", true);
        $("#btn_nova_permissao").prop("disabled", true);
        $("#btn_alterar_permissao").prop("disabled", true);
        $("#id_id_permissao").prop("disabled", true);
        $("#id_id_permissao").val("0");
        fechaGuiasUsuarios();
        $('#li-form-permissoes').addClass('active');
        $('#form-permissoes').addClass('in active');
        $("#id_descricao").focus();
        removeClassMenu();
        $('#permissoes').addClass('active');
        $('#permissoes_nova').addClass('active');
    });

    $('#btn_cancelar_operacao_permissao').on('click', function(event){
        event.preventDefault();
        $("#formPermissoes :input").val("");
        $("#formPermissoes select").val("0");
        $("#formPermissoes :input").prop("disabled", true);
        $("#formPesquisaPermissoes :input").prop("disabled", false);
        $("#btn_nova_permissao").prop("disabled", false);
        $("#btn_alterar_permissao").prop("disabled", true);
        $("#btn_sair_permissao").prop("disabled", false);
        $("#id_id_permissao").prop("disabled", true);
        $("#id_id_permissao").prop("disabled", true);
        $("#id_id_permissao").val("0");
    });

    $('#btn_alterar_permissao').on('click', function(event){
        event.preventDefault();
        $("#formPermissoes :input").prop("disabled", false);
        $("#formPesquisaPermissoes :input").prop("disabled", true);
        $("#btn_nova_permissao").prop("disabled", true);
        $("#btn_salvar_permissao").prop("disabled", false);
        $("#id_id_permissao").prop("disabled", true);
    });

    $('#btn_sair_permissao').on('click', function(event){
        event.preventDefault();
        $("#formPermissoes :input").val("");
        $("#formPermissoes select").val("0");
        $("#formPermissoes :input").prop("disabled", true);
        $("#formPesquisaPermissoes :input").prop("disabled", false);
        $("#btn_nova_permissao").prop("disabled", false);
        $("#btn_alterar_permissao").prop("disabled", true);
        $("#btn_sair_permissao").prop("disabled", false);
        $("#id_id_permissao").prop("disabled", true);
        $("#id_id_permissao").prop("disabled", true);
        $("#id_id_permissao").val("0");
        fechaGuiasUsuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

    $('#permissoes_todas').on('click', function(event){
        event.preventDefault();
        fechaGuiasUsuarios();
        $('#li-tb-permissoes').addClass('active');
        $('#tb-permissoes').addClass('in active');
        removeClassMenu();
        $('#permissoes').addClass('active');
        $('#permissoes_todas').addClass('active');
        buscarPermissoes();
    });

    function salvar(form) {
    $.ajax({
        url : "cadastrar-permissao-usuario/",
        type : "POST",
        data : { id : $('#id_id_permissao').val(), form : form},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json)
            }else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id_permissao').val(json.id);
                $("#formPermissoes :input").prop("disabled", true);
                $("#btn_alterar_permissao").prop("disabled", false);
                $("#btn_nova_permissao").prop("disabled", false);
                $("#btn_sair_permissao").prop("disabled", false);
                $("#formPesquisaPermissoes :input").prop("disabled", false);
                mensagemSucesso(json)
            }else if(json.negado){
            mensagemErroOperacao(json);
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
    };

    function mudaStatusPermissoesUsuario(permissao_id, status) {
        $.ajax({
            url : "muda-status-permissoes-usuario/",
            type : "POST",
            data : { permissao_id : permissao_id, status : status },

            success : function(json) {
                if (json.sucesso){
                    $('#status-permissao-'+permissao_id).html("<span>"+status+"</span>");
                    $('#status-li-permissao-'+permissao_id).html("<span>"+status+"</span>");
                    mensagemSucesso(json)
                }else if(json.info){
                    titulo = json.titulo;
                    mensagem = json.mensagem;
                    mensagemInfo(titulo, mensagem);
                }else if(json.erro){
                    mensagemErroOperacao(json);
                }
            },

            error : function(xhr,errmsg,err) {

                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };

    function buscarRegistro(registro_id) {
        $.ajax({
            url : "buscar-permissao-usuario/",
            type : "GET",
            data : { id : registro_id},

            success : function(json) {
                $('#formPermissoes :input').val('');
                $('#formPermissoes select').val('0');
                $('#id_id_permissao').val('0');
                $("#formPermissoes :input").prop("disabled", true);
                $("#btn_alterar_permissao").prop("disabled", false);
                $("#btn_sair_permissao").prop("disabled", false);
                $("#btn_nova_permissao").prop("disabled", false);
                if(json.campos){
                    $('.form-group').removeClass('has-error').addClass('has-success');
                    $('#id_id_permissao').val(json.id);
                    $('#id_permissao').val(json.id);
                    for (var i in json.campos) {
                        $('#'+i).val(json.campos[i]).val;
                    }
                    //$("#formPermissoes :input").prop("disabled", true);
                    //mensagemSucesso(json)
                }else if(json.info){
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemInfo(titulo, mensagem);
			}
            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };


    function buscarPermissoes(){
        $.ajax({
            url : "buscar-permissoes-usuarios/",
            type : "GET",
            data : {},
            success : function(json) {
                    $('#tabela-permissoes').html(
                    '<table id="tb_permissoes" class="table table-bordered table-hover animated fadeInDown"  style="white-space: nowrap;" width="100%">'+
                        '<thead>'+
                            '<tr>'+
                                '<th data-class="expand">ID</th>'+
                                '<th>Descriçao</th>'+
                                '<th>Empresa</th>'+
                                '<th data-hide="phone,tablet">Administrador superior</th>'+
                                '<th data-hide="phone,tablet">Administrador</th>'+
                                '<th data-hide="phone,tablet">Cadastro de usuarios</th>'+
                                '<th data-hide="phone,tablet">Permissoes de usuarios</th>'+
                                '<th data-hide="phone,tablet">Cadastro de clientes</th>'+
                                '<th data-hide="phone,tablet">Cadastro de fornecedores</th>'+
                                '<th data-hide="phone,tablet">Cadastro de produtos</th>'+
                                '<th data-hide="phone,tablet">Tabela de preços</th>'+
                                '<th data-hide="phone,tablet">Registro de vendas</th>'+
                                '<th data-hide="phone,tablet">Registro de compras</th>'+
                                '<th data-hide="phone,tablet">Saida de produtos</th>'+
                                '<th data-hide="phone,tablet">Entrada de produtos</th>'+
                                '<th data-hide="phone,tablet">Contas a pagar</th>'+
                                '<th data-hide="phone,tablet">Contas a receber</th>'+
                                '<th data-hide="phone,tablet">Pagamentos</th>'+
                                '<th data-hide="phone,tablet">Recebimentos</th>'+
                                '<th data-hide="phone,tablet">Conteúdo do site</th>'+
                                '<th data-hide="phone,tablet">Menságens do site</th>'+
                                '<th data-hide="phone,tablet">Observações</th>'+
                            '</tr>'+
                        '</thead>'+
                        '<tbody></tbody>'+
                    '</table>'
                    )
                for(var i=0;json.length>i;i++){
                    $('#tb_permissoes').append('<tr>'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].descricao+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="background-color:black;">'+
                                        '<li id="status-1-li-permissao-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].descricao+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="buscar-permissao-'+json[i].id+'">EDITAR REGISTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="ativar-1-permissao-'+json[i].id+'">ATIVAR PERMISSÃO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="desativar-1-permissao-'+json[i].id+'">DESATIVAR PERMISSÃO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="excluir-1-permissao-'+json[i].id+'">EXCLUIR PERMISSÃO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-permissao-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="background-color:black;">'+
                                        '<li id="status-li-permissao-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status+'</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="ativar-permissao-'+json[i].id+'">ATIVAR PERMISSÃO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="desativar-permissao-'+json[i].id+'">DESATIVAR PERMISSÃO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;color:white;" id="excluir-permissao-'+json[i].id+'">EXCLUIR PERMISSÃO</a>'+
                                        '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].administrador_super+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].administrador+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].usuarios+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].permissoes_usuarios+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].clientes+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].fornecedores+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].produtos+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].tabela_precos+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].vendas+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].compras+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].saida_produtos+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].entrada_produtos+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].contas_pagar+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].contas_receber+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].pagamentos+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].recebimentos+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].conteudo_site+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].mensagens_site+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].observacoes+'</td>'+
                    '</tr>'
                    )
                }
                pageSetUp();

                var responsiveHelper_tb_permissoes = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

			$('#tb_permissoes').dataTable({
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
					if (!responsiveHelper_tb_permissoes) {
						responsiveHelper_tb_permissoes = new ResponsiveDatatablesHelper($('#tb_permissoes'), breakpointDefinition);
					}
				},
				"rowCallback" : function(nRow) {
					responsiveHelper_tb_permissoes.createExpandIcon(nRow);
				},
				"drawCallback" : function(oSettings) {
					responsiveHelper_tb_permissoes.respond();
				}
			});

			if(json.info){
                titulo = json.titulo;
                mensagem = json.mensagem;
                mensagemInfo(titulo, mensagem);
			}
            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    };


    $("#id_administrador_super").on('change', function(){
            if ($("#id_administrador_super").val() == '1'){
                $("#formPermissoes select").val("1");
            }else if ($("#id_administrador_super").val() == '0'){
                $("#formPermissoes select").val("0");
            };
        });

        $("#id_administrador").on('change', function(){
            if ($("#id_administrador").val() == '1'){
                $("#formPermissoes select").val("1");
                $("#id_administrador_super").val('0');
            }else if ($("#id_administrador").val() == '0'){
                $("#formPermissoes select").val("0");
            };
        });

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

