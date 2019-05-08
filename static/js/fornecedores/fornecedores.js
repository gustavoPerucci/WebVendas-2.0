$(function() {

    var status = '';
    var nome = '';
    var id_fornecedor = 0;
    var pessoa = '';
    var titulo = '';
    var mensagem = '';

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

    $('#formPesquisaFornecedoresNome').on('submit', function(event){
        event.preventDefault();
        status = '';
        id_fornecedor = '';
        nome = $('#nome_fornecedor').val();
        buscarFornecedores(status, nome, id_fornecedor);
        removeClassMenu()
    });

    $('#formPesquisaFornecedoresID').on('submit', function(event){
        event.preventDefault();
        status = '';
        nome = '';
        id_fornecedor = $('#id_fornecedor').val();
        buscarFornecedores(status, nome, id_fornecedor);
        removeClassMenu()
    });

    $("#corpo").on('click', 'a[id^=ativar-fornecedor-]', function(){
         id_fornecedor = $(this).attr('id').split('-')[2];
         status = 'ATIVO';
         mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=ativar-1-fornecedor-]', function(){
         id_fornecedor = $(this).attr('id').split('-')[3];
         status = 'ATIVO';
         mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=excluir-fornecedor-]', function(){
         id_fornecedor = $(this).attr('id').split('-')[2];
         status = 'EXCLUIDO';
         mudaStatusFornecedor(id_fornecedor, status)
    });

     $("#corpo").on('click', 'a[id^=excluir-1-fornecedor-]', function(){
         id_fornecedor = $(this).attr('id').split('-')[3];
         status = 'EXCLUIDO';
         mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-fornecedor-]', function(){
        id_fornecedor = $(this).attr('id').split('-')[2];
        status = 'INATIVO';
        mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=desativar-1-fornecedor-]', function(){
        id_fornecedor = $(this).attr('id').split('-')[3];
        status = 'INATIVO';
        mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=bloquear-fornecedor-]', function(){
        id_fornecedor = $(this).attr('id').split('-')[2];
        status = 'BLOQUEADO';
        mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=bloquear-1-fornecedor-]', function(){
        id_fornecedor = $(this).attr('id').split('-')[3];
        status = 'BLOQUEADO';
        mudaStatusFornecedor(id_fornecedor, status)
    });

    $("#corpo").on('click', 'a[id^=buscar-fornecedor-]', function(){
        id_fornecedor = $(this).attr('id').split('-')[2];
        buscarFornecedor(id_fornecedor)
    });

    $('#formPesquisa').on('submit', function(event){
        event.preventDefault();
        id_fornecedor = $('#id_Pesquisa').val();
        buscarFornecedor(id_fornecedor)

    });

    $("#fornecedores_ativos").on('click', function(){
        event.preventDefault();
        status = 'ATIVO';
        nome = '';
        id_fornecedor ='';
        pessoa = 'FISICA';
        buscarFornecedores(status, nome, id_fornecedor);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#fornecedores_inativos").on('click', function(){
        event.preventDefault();
        status = 'INATIVO';
        nome = '';
        id_fornecedor ='';
        buscarFornecedores(status, nome, id_fornecedor);
        removeClassMenu();
        $(this).addClass('active');
    });

     $("#fornecedores_excluidos").on('click', function(){
        event.preventDefault();
        status = 'EXCLUIDO';
        nome = '';
        id_fornecedor ='';
        buscarFornecedores(status, nome, id_fornecedor);
        removeClassMenu();
        $(this).addClass('active');
    });

    $("#fornecedores_bloqueados").on('click', function(){
        event.preventDefault();
        status = 'BLOQUEADO';
        nome = '';
        id_fornecedor ='';
        buscarFornecedores(status, nome, id_fornecedor);
        removeClassMenu();
        $(this).addClass('active');
    });

    function removeClassMenu(){
            $('#fornecedores_ativos').removeClass('active');
            $('#fornecedores_inativos').removeClass('active');
            $('#fornecedores_excluidos').removeClass('active');
            $('#fornecedores_bloqueados').removeClass('active');
        };

    function salvar(form, pessoa) {
    $.ajax({
        url : "/fornecedores/cadastrar-fornecedor/",
        type : "POST",
        data : { id : $('#id_id').val(), form : form, pessoa : pessoa },

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
                $("#form :input").prop("disabled", true);
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

    function mudaStatusFornecedor(id_fornecedor, status) {
        $.ajax({
            url : "/fornecedores/muda-status-fornecedor/",
            type : "POST",
            data : { id_fornecedor : id_fornecedor, status : status },

            success : function(json) {
                $('#status-fornecedor-'+id_fornecedor).html("<span>"+json.status+"</span>");
                $('#status-li-fornecedor-'+id_fornecedor).html("<span>"+json.status+"</span>");
                mensagemSucesso(json)
            },

            error : function(xhr,errmsg,err) {

                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };
});