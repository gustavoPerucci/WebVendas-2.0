$(function() {

    var status = '';
    var nome = '';
    var registro_id = 0;
    var id_colaborador = 0;

    $('#form').on('submit', function(event){
        event.preventDefault();
        var form = $('#form').serialize(true);
        salvar(form);
    });

    $('#formPesquisaColaboradoresNome').on('submit', function(event){
        event.preventDefault();
        status = '';
        id_colaborador = '';
        nome = $('#nome_colaborador').val();
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    $('#formPesquisaColaboradoresID').on('submit', function(event){
        event.preventDefault();
        status = '';
        nome = '';
        id_colaborador = $('#id_colaborador').val();
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    $("#corpo").on('click', 'a[id^=ativar-colaborador-]', function(){
         registro_id = $(this).attr('id').split('-')[2];
         status = 'ATIVO';
         mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=ativar-1-colaborador-]', function(){
         registro_id = $(this).attr('id').split('-')[3];
         status = 'ATIVO';
         mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-colaborador-]', function(){
         registro_id = $(this).attr('id').split('-')[2];
         status = 'EXCLUIDO';
         mudaStatusColaborador(registro_id, status)
    });

     $("#corpo").on('click', 'a[id^=excluir-1-colaborador-]', function(){
         registro_id = $(this).attr('id').split('-')[3];
         status = 'EXCLUIDO';
         mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=afastar-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'AFASTADO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=afastar-1-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'AFASTADO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'INATIVO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-1-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'INATIVO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=aposentar-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'APOSENTADO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=aposentar-1-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'APOSENTADO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=demitir-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        status = 'DEMITIDO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=demitir-1-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[3];
        status = 'DEMITIDO';
        mudaStatusColaborador(registro_id, status)
    });

    $("#corpo").on('click', 'a[id^=buscar-colaborador-]', function(){
        registro_id = $(this).attr('id').split('-')[2];
        buscarRegistro(registro_id)
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        registro_id = $('#id_Pesquisa').val();
        buscarRegistro(registro_id)

    });

    $("#colaboradores_ativos").on('click', function(){
        event.preventDefault();
        status = 'ATIVO';
        nome = '';
        id_colaborador ='';
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    $("#colaboradores_inativos").on('click', function(){
        event.preventDefault();
        status = 'INATIVO';
        nome = '';
        id_colaborador ='';
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

     $("#colaboradores_excluidos").on('click', function(){
        event.preventDefault();
        status = 'EXCLUIDO';
        nome = '';
        id_colaborador ='';
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    $("#colaboradores_afastados").on('click', function(){
        event.preventDefault();
        status = 'AFASTADO';
        nome = '';
        id_colaborador ='';
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    $("#colaboradores_aposentados").on('click', function(){
        event.preventDefault();
        status = 'APOSENTADO';
        nome = '';
        id_colaborador ='';
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    $("#colaboradores_demitidos").on('click', function(){
        event.preventDefault();
        status = 'DEMITIDO';
        nome = '';
        id_colaborador ='';
        buscarColaboradores(status, nome, id_colaborador);
        removeClassMenu();
        $(this).addClass('active');
        fechaGuiasColaboradores();
        $('#li-tb-colaboradores').addClass('active');
        $('#tb-colaboradores').addClass('in active');
    });

    function salvar(form) {
    $.ajax({
        url : "cadastrar-colaborador/",
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

    function mudaStatusColaborador(registro_id, status) {
        $.ajax({
            url : "muda-status-colaborador/",
            type : "POST",
            data : { registro_id : registro_id, status : status },

            success : function(json) {
                if (json.sucesso){
                    $('#status-colaborador-'+registro_id).html("<span>"+json.status+"</span>");
                    $('#status-li-colaborador-'+registro_id).html("<span>"+json.status+"</span>");
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
            url : "buscar-colaborador/",
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



    function buscarColaboradores(status, nome, id_colaborador) {
        $('#tb_registros tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "buscar-colaboradores/",
            type : "GET",
            data : { status : status, nome: nome, id_colaborador: id_colaborador },
            success : function(json) {
                    $('#tabela-colaboradores').html(
                    '<table id="tb_registros" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                    '<tr style="white-space: nowrap;">'+
                        '<th data-class="expand">ID</th>'+
                        '<th>Nome</th>'+
                        '<th data-hide="phone,tablet">RG</th>'+
                        '<th data-hide="phone,tablet">CPF</th>'+
                        '<th data-hide="phone,tablet">Telefone</th>'+
                        '<th data-hide="phone,tablet">E-mail</th>'+
                        '<th data-hide="phone,tablet">Data nasc.</th>'+
                        '<th data-hide="phone,tablet">Est.civil</th>'+
                        '<th data-hide="phone,tablet">Sexo</th>'+
                        '<th data-hide="phone,tablet">Status</th>'+
                        '<th data-hide="phone,tablet">Cep</th>'+
                        '<th data-hide="phone,tablet">Endereço</th>'+
                        '<th data-hide="phone,tablet">Complemento</th>'+
                        '<th data-hide="phone,tablet">Bairro</th>'+
                        '<th data-hide="phone,tablet">Cidade</th>'+
                        '<th data-hide="phone,tablet">Empresa</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody style="white-space: nowrap;">'+
                '</tbody>'+
                '</table>'
                    )
                for(var i=0;json.length>i;i++){
                    $('#tb_registros').append('<tr> id="linha-'+json[i].id+'"'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].nome+' '+json[i].sobre_nome+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-colaborador-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].nome+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="buscar-colaborador-'+json[i].id+'">EDITAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="afastar-colaborador-'+json[i].id+'">AFASTAR COLABORADOR</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-ativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-1-colaborador-'+json[i].id+'">ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-desativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-1-colaborador-'+json[i].id+'">DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-fora-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="aposentar-1-colaborador-'+json[i].id+'">APOSENTAR COLABORADOR</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-fora-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="demitir-1-colaborador-'+json[i].id+'">DEMITIR COLABORADOR</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-excluir-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-1-colaborador-'+json[i].id+'">EXCLUIR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].rg+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].cpf+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].telefone+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].email+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].data_nascimento+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].estado_civil+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].sexo+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-colaborador-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-colaborador-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status+'</li>'+
                                        '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" id="afastar-colaborador-'+json[i].id+'">AFASTAR COLABORADOR</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-ativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-colaborador-'+json[i].id+'">ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-desativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-colaborador-'+json[i].id+'">DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-fora-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="aposentar-colaborador-'+json[i].id+'">APOSENTAR COLABORADOR</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-fora-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="demitir-colaborador-'+json[i].id+'">DEMITIR COLABORADOR</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-excluir-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-colaborador-'+json[i].id+'">EXCLUIR CADASTRO</a>'+
                                        '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].cep+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].endereco+', '+json[i].numero+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].complemento+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].bairro+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].cidade+'|'+json[i].estado+'</td>'+
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

});

function fechaGuiasColaboradores(){
    $('#li-tb-colaboradores').removeClass('active');
    $('#tb-colaboradores').removeClass('in active');
    $('#li-tb-permissoes').removeClass('active');
    $('#tb-permissoes').removeClass('in active');
    $('#form-permissoes').removeClass('in active');
    $('#li-form-permissoes').removeClass('active');
};


function removeClassMenu(){
    $('#colaboradores_ativos').removeClass('active');
    $('#colaboradores_inativos').removeClass('active');
    $('#colaboradores_afastados').removeClass('active');
    $('#colaboradores_aposentados').removeClass('active');
    $('#colaboradores_demitidos').removeClass('active');
    $('#colaboradores_excluidos').removeClass('active');
    $('#permissoes_nova').removeClass('active');
    $('#permissoes').removeClass('active');
    $('#permissoes_todas').removeClass('active');
};