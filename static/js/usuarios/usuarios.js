$(function() {

    var status = '';
    var nome = '';
    var registro_id = 0;
    var id_usuario = 0;

    $('#form').on('submit', function(event){
        event.preventDefault();
        var form = $('#form').serialize(true);
        salvar(form);
    });

    $('#formPesquisaUsuariosNome').on('submit', function(event){
        event.preventDefault();
        status = '';
        id_usuario = '';
        nome = $('#nome_usuario').val();
        buscarusUarios(status, nome, id_usuario);
        removeClassMenu();
        fechaGuiasusuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

    $('#formPesquisaUsuariosID').on('submit', function(event){
        event.preventDefault();
        status = '';
        nome = '';
        id_usuario = $('#id_usuario').val();
        buscarusUarios(status, nome, id_usuario);
        removeClassMenu();
        fechaGuiasusuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

    $("#corpo").on('click', 'a[id^=ativar-usuario-]', function(){
         registro_id = $(this).attr('id').split('-')[2];
         status = 'ATIVO';
         mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=ativar-1-usuario-]', function(){
         registro_id = $(this).attr('id').split('-')[3];
         status = 'ATIVO';
         mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-usuario-]', function(){
         registro_id = $(this).attr('id').split('-')[2];
         status = 'EXCLUIDO';
         mudaStatusUsuario(registro_id, status)
    });

     $("#corpo").on('click', 'a[id^=excluir-1-usuario-]', function(){
         registro_id = $(this).attr('id').split('-')[3];
         status = 'EXCLUIDO';
         mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-usuario-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'INATIVO';
        mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-1-usuario-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'INATIVO';
        mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=bloquerar-1-usuario-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'BLOQUEADO';
        mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=bloquerar-usuario-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'BLOQUEADO';
        mudaStatusUsuario(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=buscar-usuario-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        buscarRegistro(registro_id)
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        registro_id = $('#id_Pesquisa').val();
        buscarRegistro(registro_id)

    });

    $("#usuarios_ativos").on('click', function(){
        event.preventDefault();
        status = 'ATIVO';
        nome = '';
        id_usuario ='';
        buscarusUarios(status, nome, id_usuario);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasusuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

    $("#usuarios_inativos").on('click', function(){
        event.preventDefault();
        status = 'INATIVO';
        nome = '';
        id_usuario ='';
        buscarusUarios(status, nome, id_usuario);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasusuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

     $("#usuarios_excluidos").on('click', function(){
        event.preventDefault();
        status = 'EXCLUIDO';
        nome = '';
        id_usuario ='';
        buscarusUarios(status, nome, id_usuario);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasusuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

    $("#usuarios_bloqueados").on('click', function(){
        event.preventDefault();
        status = 'BLOQUEADO';
        nome = '';
        id_usuario ='';
        buscarusUarios(status, nome, id_usuario);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasusuarios();
        $('#li-tb-usuarios').addClass('active');
        $('#tb-usuarios').addClass('in active');
    });

    function salvar(form) {
    $.ajax({
        url : "cadastrar-usuario/",
        type : "POST",
        data : { id : $('#id_id').val(), form : form},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json)
            }else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id').val(json.id);
                $("#form :input").prop("disabled", true);
                $("#formPesquisa :input").prop("disabled", false);
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

    function mudaStatusUsuario(registro_id, status) {
        $.ajax({
            url : "muda-status-usuario/",
            type : "POST",
            data : { registro_id : registro_id, status : status },

            success : function(json) {
                if (json.sucesso){
                    $('#status-usuario-'+registro_id).html("<span>"+status+"</span>");
                    $('#status-li-usuario-'+registro_id).html("<span>"+status+"</span>");
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
            url : "buscar-usuario/",
            type : "GET",
            data : { id : registro_id},

            success : function(json) {
                $('#form :input').val('');
                $('#id_id').val('0');
                $('#btn_salvar').val('Salvar registro');
                if(json.campos){
                    $('.form-group').removeClass('has-error').addClass('has-success');
                    $('#id_id').val(json.id);
                    $('#id_Pesquisa').val(json.id);
                    for (var i in json.campos) {
                        $('#'+i).val(json.campos[i]).val;
                    }
                    //$("#form :input").prop("disabled", true);
                    //mensagemSucesso(json)
                }else if(json.info){
                    titulo = json.titulo;
                    mensagem = json.mensagem;
                    mensagemInfo(titulo, mensagem);
                    $("#form :input").prop("disabled", true);
                    $(".btn").hide();
			    }
            },

            error : function(xhr,errmsg,err) {
                mensagemErroSistema()
                console.log(xhr.status + ": " + xhr.responseText);
             }
        });
    };



    function buscarusUarios(status, nome, id_usuario) {
        $('#tb_registros tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "buscar-usuarios/",
            type : "GET",
            data : { status : status, nome: nome, id_usuario: id_usuario },
            success : function(json) {
                    $('#tabela-usuarios').html(
                    '<table id="tb_registros" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                    '<tr style="white-space: nowrap;">'+
                        '<th data-class="expand">Nome</th>'+
                        '<th>Colaborador</th>'+
                        '<th data-hide="phone,tablet">E-mail</th>'+
                        '<th data-hide="phone,tablet">Status</th>'+
                        '<th data-hide="phone,tablet">Permissoes</th>'+
                        '<th data-hide="phone,tablet">Empresa</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody style="white-space: nowrap;">'+
                '</tbody>'+
                '</table>'
                    )
                for(var i=0;json.length>i;i++){
                    $('#tb_registros').append('<tr id="linha-'+json[i].id+'">'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].nome+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-usuario-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].nome+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-ativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-1-usuario-'+json[i].id+'">ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-desativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-1-usuario-'+json[i].id+'">DESATIVAR CADASTRO</a>'+
                                        '</li>'+

                                        '<li class="divider"></li>'+
                                        '<li id="li-1-fora-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="bloquerar-1-usuario-'+json[i].id+'">BLOQUEAR USUÁRIO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-excluir-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-1-usuario-'+json[i].id+'">EXCLUIR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].colaborador+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].email+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-usuario-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-usuario-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status+'</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-ativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-usuario-'+json[i].id+'">ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-desativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-usuario-'+json[i].id+'">DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-fora-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="bloquerar-usuario-'+json[i].id+'">BLOQUEAR USUÁRIO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-excluir-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-usuario-'+json[i].id+'">EXCLUIR CADASTRO</a>'+
                                        '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].permissoes+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].empresa+'</td>'+
                    '</tr>'
                    )
                }
                pageSetUp();

                var responsiveHelper_tb_registros = undefined;
                var breakpointDefinition = {
                    tablet : 1024,
                    phone : 480
                };

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

function fechaGuiasUsuarios(){
    $('#li-tb-usuarios').removeClass('active');
    $('#tb-usuarios').removeClass('in active');
    $('#li-tb-permissoes').removeClass('active');
    $('#tb-permissoes').removeClass('in active');
    $('#form-permissoes').removeClass('in active');
    $('#li-form-permissoes').removeClass('active');
};


function removeClassMenu(){
    $('#usuarios_ativos').removeClass('active');
    $('#usuarios_inativos').removeClass('active');
    $('#usuarios_bloqueados').removeClass('active');
    $('#usuarios_excluidos').removeClass('active');
    $('#permissoes_nova').removeClass('active');
    $('#permissoes').removeClass('active');
    $('#permissoes_todas').removeClass('active');
};