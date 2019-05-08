var titulo, mensagem = '';

function mensagemErroSistema(){
    $.bigBox({
	    title : "HOUVE UM ERRO INTERNO NO SISTEMA !!!",
		content : "<i>Por favor, contate o suporte técnico através do e-mail: suporte@atpcsistemas.com.br...</i>",
		color : "#C46A69",
		icon : "fa fa-warning shake animated",
		number : "",
		timeout : 20000
	});
};

function mensagemSucesso(json){
    $.smallBox({
        title : "<i>"+json.titulo+"</i>",
        content : "<i class='fa fa-clock-o'></i> <i>"+json.mensagem+"</i>",
        color : "#739E73",
        iconSmall : "fa fa-thumbs-up bounce animated",
        timeout : 5000
    });
};

function mensagemErroOperacao(json){
    $.smallBox({
        title : "<i>"+json.titulo+"</i>",
        content : "<i class='fa fa-clock-o'></i> <i>"+json.mensagem+"</i>",
        color : "#C46A69",
        iconSmall : "fa fa-thumbs-down bounce animated",
        timeout : 20000
    });
};

function mensagemAlerta(titulo, mensagem){
    $.smallBox({
        title : "<i>"+titulo+"</i>",
        content : "<i class='fa fa-clock-o'></i> <i>"+mensagem+"</i>",
        color : "#C79121",
        iconSmall : "fa fa-thumbs-down bounce animated",
        timeout : 20000
    });
};

function mensagemInfo(titulo, mensagem){
    $.smallBox({
        title : "<i>"+titulo+"</i>",
        content : "<i class='fa fa-clock-o'></i> <i>"+mensagem+"</i>",
        color : "#5384AF",
        iconSmall : "fa fa-thumbs-down bounce animated",
        timeout : 20000
    });
};