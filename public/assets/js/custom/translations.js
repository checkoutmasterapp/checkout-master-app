jQuery(document).ready(function () {

    if (translation?.translation_language) {
        jQuery("select[name='translation_language']").val(translation?.translation_language).change();
    }

    jQuery(document).on("click", "#change_language", function () {
        const selected_language = jQuery("select[name='translation_language']").val();

        jQuery.ajax({
            type: "POST",
            cache: false,
            dataType: "json",
            data: { selected_language: selected_language },
            url: `${ajax_url}/change-language`,
            success: function (response) {
                let translate_languages = response?.lang;
                jQuery.each(translate_languages, function (translate_language_key, translate_language) {
                    jQuery(`form#translation input[name='${translate_language_key}']`).val("");
                    jQuery(`form#translation input[name='${translate_language_key}']:first`).val(translate_language);
                });
            },
        });
    });

    jQuery("#translation").validate({
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                element.parent().append(error);
            } else {
                element.parent().append(error);
            }
        },
        submitHandler: function (form) {
            jQuery.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                contentType: false,
                processData: false,
                data: new FormData(form),
                url: `${ajax_url}/translations`,
                mimeType: "multipart/form-data",
                success: function (response) {
                    if (response?.status) {
                        jQuery.notify({ message: response.message }, { type: "success" });
                        setTimeout(function () {
                            window.location.href = response?.redirect_url;
                        }, 1500);
                    } else {
                        jQuery.notify({ message: response.message }, { type: "danger" });
                    }
                },
            });
        },
    });
});