    function buscarFornecedores(status, nome, id_fornecedor) {
        $.ajax({
            url : "/fornecedores/buscar-fornecedores/",
            type : "GET",
            data : { status : status, nome: nome, id_fornecedor: id_fornecedor, pessoa: 'FISICA' },
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
                                        '<li id="status-1-li-fornecedor-'+json[i].id+'" class="text-center"><span style="margin-left:10px;margin-right:10px;font-size:20px;color:orange;">'+json[i].nome_razao_social+'</span></li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="buscar-fornecedor-'+json[i].id+'">EDITAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li>'+
                                            '<a style="cursor:pointer;" id="bloquear-fornecedor-'+json[i].id+'">BLOQUEAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-ativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-1-fornecedor-'+json[i].id+'">ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-desativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-1-fornecedor-'+json[i].id+'">DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-1-excluir-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-1-fornecedor-'+json[i].id+'">EXCLUIR CADASTRO</a>'+
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
                                    '<a id="status-fornecedor-'+json[i].id+'" style="cursor:pointer;margin-left:-12px;" class="dropdown-toggle" data-toggle="dropdown">'+json[i].status+'</a>'+
                                    '<ul class="dropdown-menu pull-left text-left" style="">'+
                                        '<li id="status-li-fornecedor-'+json[i].id+'" class="text-center" style="font-size:20px;color:orange;">'+json[i].status+'</li>'+
                                        '<li class="divider"></li>'+
                                         '<li>'+
                                            '<a style="cursor:pointer;" id="bloquear-fornecedor-'+json[i].id+'">BLOQUEAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-ativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="ativar-fornecedor-'+json[i].id+'">ATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-desativar-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="desativar-fornecedor-'+json[i].id+'">DESATIVAR CADASTRO</a>'+
                                        '</li>'+
                                        '<li class="divider"></li>'+
                                        '<li id="li-excluir-'+json[i].id+'">'+
                                            '<a style="cursor:pointer;" id="excluir-fornecedor-'+json[i].id+'">EXCLUIR CADASTRO</a>'+
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
                "scrollY":"400px",
                //scrollY:        '50vh',
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

function buscarFornecedor(id_fornecedor) {
    $.ajax({
        url : "/fornecedores/buscar-fornecedor/",
        type : "GET",
        data : { id : id_fornecedor, pessoa: 'FISICA' },

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
                $('#form input').val("");
				$('#form select').val("");
			    $('#form input[type=submit]').val("Salvar registro");
				$("#form :input").prop("disabled", true);
				$('.form-group').removeClass('has-error').removeClass('has-success');
				titulo = json.titulo
				mensagem = json.mensagem
				mensagemAlerta(titulo, mensagem)
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};

