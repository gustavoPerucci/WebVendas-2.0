$(function() {
    $('#id_cep').on('blur', function(event){
		var cep = $(event.target).val();
		$.getJSON("https://viacep.com.br/ws/"+ cep +"/json/?callback=?", function(data){
			//console.log(data);
			if (!("erro" in data)) {
			$('#id_cidade').val('');
			$('#id_bairro').val('');
			$('#id_endereco').val('');
			$('#id_estado').val('');
			$('#id_cidade').val(data.localidade);
			$('#id_bairro').val(data.bairro);
			$('#id_endereco').val(data.logradouro);
			$('#id_estado').val(data.uf);
			$('#id_numero').focus();
			}
            else {
                $('#id_cidade').val('');
                $('#id_bairro').val('');
                $('#id_endereco').val('');
                $('#id_estado').val('');
                $('#id_endereco').focus();
                $.smallBox({
                title : "<i>CEP NÃO ENCONTRADO . . .</i>",
                content : "<i class='fa fa-clock-o'></i> <i>Verificamos no site http://viacep.com.br, mas não encontramos o cep informado, verifique se o mesmo está correto.</i>",
                color : "#C79121",
                iconSmall : "fa fa-thumbs-down bounce animated",
                timeout : 10000
			    });

            }
		});
	});
});