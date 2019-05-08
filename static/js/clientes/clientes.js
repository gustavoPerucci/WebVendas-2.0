$(function() {

    var status = '';
    var nome = '';
    var id_cliente = 0;
    var pessoa = '';

    $('#form-pessoa-FISICA').on('submit', function(event){
        event.preventDefault();
        var form = $('#form-pessoa-FISICA').serialize(true);
        pessoa = 'FISICA';
        salvar(form, pessoa);
    });

    $('#form-pessoa-JURIDICA').on('submit', function(event){
        event.preventDefault();
        var form = $('#form-pessoa-JURIDICA').serialize(true);
        pessoa = 'JURIDICA';
        salvar(form, pessoa);
    });

    $('#formPesquisaClientesNome').on('submit', function(event){
        event.preventDefault();
        status = '';
        id_cliente = '';
        nome = $('#nome_cliente').val();
        buscarClientes(status, nome, id_cliente);
        removeClassMenu()
    });

    $('#formPesquisaClientesID').on('submit', function(event){
        event.preventDefault();
        status = '';
        nome = '';
        id_cliente = $('#id_cliente').val();
        buscarClientes(status, nome, id_cliente);
        removeClassMenu()
    });

    $("#corpo").on('click', 'a[id^=ativar-cliente-]', function(){
         event.preventDefault();
         id_cliente = $(this).attr('id').split('-')[2];
         status = 'ATIVO';
         mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=ativar-1-cliente-]', function(){
         id_cliente = $(this).attr('id').split('-')[3];
         status = 'ATIVO';
         mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-cliente-]', function(){
         event.preventDefault();
         id_cliente = $(this).attr('id').split('-')[2];
         status = 'EXCLUIDO';
         mudaStatusCliente(id_cliente, status)
    });

     $("#corpo").on('click', 'a[id^=excluir-1-cliente-]', function(){
         event.preventDefault();
         id_cliente = $(this).attr('id').split('-')[3];
         status = 'EXCLUIDO';
         mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=inadipLente-cliente-]', function(){
        event.preventDefault();
        console.log('clicado')
        id_cliente = $(this).attr('id').split('-')[2];
        status = 'INADIPLENTE';
        mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=inadiplente-1-cliente-]', function(){
        event.preventDefault();
        console.log('clicado')
        id_cliente = $(this).attr('id').split('-')[3];
        status = 'INADIPLENTE';
        mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-cliente-]', function(){
        event.preventDefault();
        id_cliente = $(this).attr('id').split('-')[2];
        status = 'INATIVO';
        mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-1-cliente-]', function(){
        event.preventDefault();
        id_cliente = $(this).attr('id').split('-')[3];
        status = 'INATIVO';
        mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=bloquear-cliente-]', function(){
        event.preventDefault();
        id_cliente = $(this).attr('id').split('-')[2];
        status = 'BLOQUEADO';
        mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=bloquear-1-cliente-]', function(){
        event.preventDefault();
        id_cliente = $(this).attr('id').split('-')[3];
        status = 'BLOQUEADO';
        mudaStatusCliente(id_cliente, status)
    });

    $("#corpo").on('click', 'a[id^=buscar-cliente-]', function(){
        id_cliente = $(this).attr('id').split('-')[2];
        buscarCliente(id_cliente)
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        id_cliente = $('#id_Pesquisa').val();
        buscarCliente(id_cliente)

    });

    $("#clientes_ativos").on('click', function(){
        event.preventDefault();
        status = 'ATIVO';
        nome = '';
        id_cliente ='';
        buscarClientes(status, nome, id_cliente);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#clientes_inativos").on('click', function(){
        event.preventDefault();
        status = 'INATIVO';
        nome = '';
        id_cliente ='';
        buscarClientes(status, nome, id_cliente);
        removeClassMenu();
        $(this).addClass('active');
    });

     $("#clientes_excluidos").on('click', function(){
        event.preventDefault();
        status = 'EXCLUIDO';
        nome = '';
        id_cliente ='';
        buscarClientes(status, nome, id_cliente);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#clientes_bloqueados").on('click', function(){
        event.preventDefault();
        status = 'BLOQUEADO';
        nome = '';
        id_cliente ='';
        buscarClientes(status, nome, id_cliente);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#clientes_inadiplentes").on('click', function(){
        event.preventDefault();
        status = 'INADIPLENTE';
        nome = '';
        id_cliente ='';
        buscarClientes(status, nome, id_cliente);
        removeClassMenu();
        $(this).addClass('active');
    });

    function removeClassMenu(){
            $('#clientes_ativos').removeClass('active');
            $('#clientes_inativos').removeClass('active');
            $('#clientes_excluidos').removeClass('active');
            $('#clientes_bloqueados').removeClass('active');
            $('#clientes_inadiplentes').removeClass('active');
        };

    function salvar(form, pessoa) {
    $.ajax({
        url : "/clientes/cadastrar-cliente/",
        type : "POST",
        data : { id : $('#id_id').val(), form : form, pessoa : pessoa},

        success : function(json) {
            if (json.erro){
                $('.form-group').removeClass('has-error');
                for (var i=0; i< json.erro.length; i++){
                    $('#div_'+json.erro[i]).addClass('has-error');
                }
                mensagemErroOperacao(json)
            }

            else if(json.success){
                $('.form-group').removeClass('has-error').addClass('has-success');
                $('#id_id').val(json.id);
                $(".form-group :input").prop("disabled", true);
                $("#formPesquisa :input").prop("disabled", false);
                mensagemSucesso(json)
            }
        },

        error : function(xhr,errmsg,err) {
            mensagemErroSistema()
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
};

    function mudaStatusCliente(id_cliente, status){
            console.log(id_cliente);
        $.ajax({
            url : "/clientes/muda-status-cliente/",
            type : "POST",
            data : { id_cliente : id_cliente, status : status },

            success : function(json) {

                $('#status-cliente-'+id_cliente).html("<span>"+json.status+"</span>");
                $('#status-li-cliente-'+id_cliente).html("<span>"+json.status+"</span>");
                mensagemSucesso(json)
            },

            error : function(xhr,errmsg,err) {

                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };

    $("#corpo").on('click', 'a[id^=tabela-precos-cliente-]', function(){
        status = $(this).attr('title');
        id_cliente = $(this).attr('id').split('-')[3];
        if (status == 'ATIVO'){
        $.ajax({
            url : '/produtos/tabela-precos-cliente/'+id_cliente+'/',
            type : "GET",
            data : {verifica_permissoes : 1,},

            success : function(json) {
                if (json.permissoes){
                window.open('/produtos/tabela-precos-cliente/'+id_cliente+'/');                
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
        }else{
            mensagemInfo('AÇÃO INTERROMPIDA PELO SISTEMA...','Esta funcionalidade está disponível apenas para os clientres ATIVOS...');
        }
    });

});