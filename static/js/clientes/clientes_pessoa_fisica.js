
function buscarClientes(status, nome, id_cliente) {
        $('#tb_registros tbody').html('<tr><td colspan="11"><h1 class="text-center"><img src="/static/img/loader-big.gif" alt="me"></h1></td></tr>');
        $.ajax({
            url : "/clientes/buscar-clientes/",
            type : "GET",
            data : { status : status, nome: nome, id_cliente: id_cliente, pessoa: 'FISICA' },
            success : function(json) {
                    $('#corpo').html(
                    '<table id="tb_registros" class="table table-bordered table-hover animated fadeInDown" width="100%">'+
                    '<thead>'+
                    '<tr style="white-space: nowrap;">'+
                        '<th data-class="expand">ID</th>'+
                        '<th>Nome</th>'+
                        '<th data-hide="phone,tablet">RG</th>'+
                        '<th data-hide="phone,tablet">CPF</th>'+
                        '<th data-hide="phone,tablet">Telefone</th>'+
                        '<th data-hide="phone,tablet">Celular</th>'+
                        '<th data-hide="phone,tablet">E-mail</th>'+
                        '<th data-hide="phone,tablet">Status</th>'+
                        '<th data-hide="phone,tablet">Data nasc.</th>'+
                        '<th data-hide="phone,tablet">Est.civil</th>'+
                        '<th data-hide="phone,tablet">Sexo</th>'+
                        '<th data-hide="phone,tablet">Cep</th>'+
                        '<th data-hide="phone,tablet">Endereco</th>'+
                        '<th data-hide="phone,tablet">Complemento</th>'+
                        '<th data-hide="phone,tablet">bairro</th>'+
                        '<th data-hide="phone,tablet">Cidade</th>'+
                        '<th data-hide="phone,tablet">Empresa</th>'+
                    '</tr>'+
                    '</thead>'+
                    '<tbody style="white-space: nowrap;">'+
                '</tbody>'+
                '</table>'

                    )
                for(var i=0;json.length>i;i++){
                    $('#tb_registros').append('<tr>'+
                    '<td class="'+json[i].classe+'">'+json[i].id+'</td>'+
                    '<td class="'+json[i].classe+'">'+
                        '<div class="col-xs-6 col-sm-6 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a style="cursor:pointer;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].nome_razao_social+' '+json[i].sobre_nome+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-1-li-cliente-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].nome_razao_social+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="buscar-cliente-'+json[i].id+'"> EDITAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="bloquear-cliente-'+json[i].id+'"> BLOQUEAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="ativar-1-cliente-'+json[i].id+'"> ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="desativar-1-cliente-'+json[i].id+'"> DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="inadiplente-1-cliente-'+json[i].id+'"> DEIXAR INADIPLENTE</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="excluir-1-cliente-'+json[i].id+'"> EXCLUIR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" title="'+json[i].status+'" id="tabela-precos-cliente-'+json[i].id+'"> TABELA DE PREÇOS</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].rg_inscricao_estadual+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].cpf_cnpj+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].telefone+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].celular+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].email+'</td>'+
                    '<td class="'+json[i].classe+'" style="white-space: nowrap;">'+
                        '<div class="col-xs-12 col-sm-12 text-left">'+
                            '<div class="txt-color-white inline-block">'+
                                '<div class="btn-group">'+
                                    '<a id="status-cliente-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-cliente-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status+'</li>'+
                                        '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" id="bloquear-cliente-'+json[i].id+'"> BLOQUEAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="ativar-cliente-'+json[i].id+'"> ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="desativar-cliente-'+json[i].id+'"> DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="inadiplente-1-cliente-'+json[i].id+'"> DEIXAR INADIPLENTE</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="excluir-cliente-'+json[i].id+'"> EXCLUIR CADASTRO</a>'+
                                        '</li>'+
                                         '<li class="divider"></li>'+
                                    '</ul>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].data_nascimento_fundacao+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].estado_civil+'</td>'+
                    '<td class="'+json[i].classe+'">'+json[i].sexo+'</td>'+
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

function buscarCliente(id_cliente) {
    $.ajax({
        url : "/clientes/buscar-cliente/",
        type : "GET",
        data : { id : id_cliente, pessoa: 'FISICA' },

        success : function(json) {
            if(json.campos){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id').val(json.id);
                $('#id_Pesquisa').val(json.id);
                for (var i in json.campos) {
                    $('#'+i).val('');
                    $('#'+i).val(json.campos[i]).val;
                }
            //$("#form :input").prop("disabled", true);
            //mensagemSucesso(json)
            }
            if(json.id == '0'){
                $('#form-pessoa-JURIDICA input').val("");
				$('#form-pessoa-JURIDICA select').val("");
			    $('#form-pessoa-JURIDICA input[type=submit]').val("Salvar registro");
				$("#form-pessoa-JURIDICA :input").prop("disabled", true);
				$('.form-group').removeClass('has-error').removeClass('has-success');
				mensagemAlerta(json)
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};

