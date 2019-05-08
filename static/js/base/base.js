
$(function(){

    var estilo_template = '';

    $("#padrao").on('click', function(){
         estilo_template = 'smart-style-0'
          removeClassEstilo()
         $(this).addClass('active');
         mudaEstiloTemplate(estilo_template)
    });

     $("#Dark-Elegance").on('click', function(){
         estilo_template = 'smart-style-1'
         removeClassEstilo()
         $(this).addClass('active');
         mudaEstiloTemplate(estilo_template)
    });

     $("#Ultra-light").on('click', function(){
         estilo_template = 'smart-style-2'
         removeClassEstilo()
         $(this).addClass('active');
         mudaEstiloTemplate(estilo_template)
    });

     $("#Skin-do-google").on('click', function(){
         estilo_template = 'smart-style-3'
         removeClassEstilo()
         $(this).addClass('active');
         mudaEstiloTemplate(estilo_template)
    });

     $("#Smash-Pixel").on('click', function(){
         estilo_template = 'smart-style-4'
         removeClassEstilo()
         $(this).addClass('active');
         mudaEstiloTemplate(estilo_template)
    });

     $("#Design-Glass").on('click', function(){
         estilo_template = 'smart-style-5'
         removeClassEstilo()
         $(this).addClass('active');
         mudaEstiloTemplate(estilo_template)
    });

     $("#Design-beta").on('click', function(){
         estilo_template = 'smart-style-6'
          $(this).addClass('active');
          removeClassEstilo()
         mudaEstiloTemplate(estilo_template)
    });

function removeClassEstilo(){
            $('#pagina').removeClass('smart-style-0');
            $('#pagina').removeClass('smart-style-1');
            $('#pagina').removeClass('smart-style-2');
            $('#pagina').removeClass('smart-style-3');
            $('#pagina').removeClass('smart-style-4');
            $('#pagina').removeClass('smart-style-5');
            $('#pagina').removeClass('smart-style-6');
            $("#Design-beta").removeClass('active');
            $("#Design-Glass").removeClass('active');
            $("#Smash-Pixel").removeClass('active');
            $("#Skin-do-google").removeClass('active');
            $("#Ultra-light").removeClass('active');
             $("#Dark-Elegance").removeClass('active');
             $("#padrao").removeClass('active');
        };


    function mudaEstiloTemplate(estilo_template) {
        $.ajax({
            url : "/usuarios/muda-estilo-template/",
            type : "POST",
            data : { estilo_template : estilo_template },

            success : function(json) {
                $('#pagina').addClass(estilo_template);
                //mensagemSucesso(json)
            },

            error : function(xhr,errmsg,err) {

                console.log(xhr.status + ": " + xhr.responseText);
                mensagemErroSistema()
            },
        });
    };


     var email = false;
    function validarEmail(email){
        var exclude=/[^@\-\.\w]|^[_@\.\-]|[\._\-]{2}|[@\.]{2}|(@)[^@]*\1/;
        var check=/@[\w\-]+\./;
        var checkend=/\.[a-zA-Z]{2,3}$/;
        if(((email.search(exclude) != -1)||(email.search(check)) == -1)||(email.search(checkend) == -1)){
        return false;
        }else{
        return true;
        }
    };

     $("#id_perfil_email").on('change', function(){
       email = validarEmail($("#id_perfil_email").val());
       if (email == false){
        $("#btn_salvar").prop("disabled", true);
        $("#id_validar_email").text('(Informe um e-mail válido...)');
       }else if(email == true){
        $("#btn_salvar").prop("disabled", false);
        $("#id_validar_email").text('');
       }
    });

    $("#perfil-usuario").on('click', function(){
        $("#modal-perfil-usuario").modal();
    });

    $('#form_perfil_usuario').on('submit', function(event){
        event.preventDefault();
        $.ajax({
            url :"/alterar-perfil-usuario/",
            type : "POST",
            data : {nome: $("#id_perfil_nome").val(), email: $("#id_perfil_email").val(),},
            success : function(json) {
                if (json.status == 'alerta'){
                    mensagemAlerta(json.titulo,json.mensagem)
                }else if(json.status == 'sucesso'){
                    $("#show-shortcut span").text($("#id_perfil_nome").val());
                    mensagemSucesso(json)
                }else if(json.status == 'erro'){
                    mensagemErroOperacao(json)
                };
            },
            error : function(xhr,errmsg,err) {
                    mensagemErroSistema();
                    console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

     pageSetUp();

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