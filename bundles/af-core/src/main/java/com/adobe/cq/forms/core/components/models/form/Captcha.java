/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2023 Adobe
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
package com.adobe.cq.forms.core.components.models.form;

import java.util.Map;

import org.osgi.annotation.versioning.ConsumerType;

import com.adobe.aemds.guide.service.GuideException;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Defines a base interface to be extended by all the different types of captcha.
 *
 * @since com.adobe.cq.forms.core.components.models.form 2.0.0
 */
@ConsumerType
public interface Captcha extends Field {

    @JsonIgnore
    default String getCloudServicePath() {
        return null;
    }

    @Deprecated
    @JsonIgnore
    String getProvider();

    @JsonIgnore
    Map<String, Object> getCaptchaProperties() throws GuideException;

    String getCaptchaDisplayMode();

    String getCaptchaProvider();

    String getCaptchaSiteKey();
}
