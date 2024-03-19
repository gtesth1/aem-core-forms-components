/*******************************************************************************
 * Copyright 2022 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
describe("Form Runtime with Date Picker", () => {

    const pagePath = "content/forms/af/core-components-it/samples/datepicker/basic.html"
    const bemBlock = 'cmp-adaptiveform-datepicker'
    let toggle_array = [];

    let formContainer = null
    const fmPropertiesUI = "/libs/fd/fm/gui/content/forms/formmetadataeditor.html/content/dam/formsanddocuments/core-components-it/samples/datepicker/basic"
    const themeRef = 'input[name="./jcr:content/metadata/themeRef"]'
    const propertiesSaveBtn = '#shell-propertiespage-doneactivator'
    // enabling theme for this test case as without theme there is a bug in custom widget css
    before(() => {
        cy.openPage(fmPropertiesUI).then(() => {
            cy.get(themeRef).should('be.visible').clear().type('/libs/fd/af/themes/canvas').then(() => {
                cy.get(propertiesSaveBtn).click().then(() => {
                    //cy.url().should('include','/aem/forms.html/content/dam/formsanddocuments/core-components-it/');
                })
            })
        })
    })

    beforeEach(() => {
        cy.previewForm(pagePath).then(p => {
            formContainer = p;
        })

        cy.fetchFeatureToggles().then((response) => {
            if (response.status === 200) {
                toggle_array = response.body.enabled;
            }
        });
    });

    const checkHTML = (id, state, displayValue) => {
        const visible = state.visible;
        const passVisibleCheck = `${visible === true ? "" : "not."}be.visible`;
        const passDisabledAttributeCheck = `${state.enabled === false ? "" : "not."}have.attr`;
        const passReadOnlyAttributeCheck = `${state.readOnly === true ? "" : "not."}have.attr`;
        const value = state.value == null ? '' : state.value;
        cy.get(`#${id}`)
            .should(passVisibleCheck)
            .invoke('attr', 'data-cmp-visible')
            .should('eq', visible.toString());
        cy.get(`#${id}`)
            .invoke('attr', 'data-cmp-enabled')
            .should('eq', state.enabled.toString());
        return cy.get(`#${id}`).within((root) => {
            cy.get('*').should(passVisibleCheck)
            cy.get('input')
                .should(passDisabledAttributeCheck, 'disabled');
            cy.get('input').should(passReadOnlyAttributeCheck, 'readonly');
            cy.get('input').should('have.value', value)
        })
    }

    it(" should get model and view initialized properly ", () => {
        expect(formContainer, "formcontainer is initialized").to.not.be.null;
        expect(formContainer._model.items.length, "model and view elements match").to.equal(Object.keys(formContainer._fields).length);
        Object.entries(formContainer._fields).forEach(([id, field]) => {
            expect(field.getId()).to.equal(id)
            expect(formContainer._model.getElement(id), `model and view are in sync`).to.equal(field.getModel())
            // if non submit field, check that all have error message in them
            if (id.indexOf('submit') === -1) {
                checkHTML(id, field.getModel().getState())
            }
        });
    })

    it(" model's changes are reflected in the html ", () => {
        const [id, fieldView] = Object.entries(formContainer._fields)[0]
        const model = formContainer._model.getElement(id)
        model.value = "2020-10-10"
        checkHTML(model.id, model.getState()).then(() => {
            model.visible = false
            return checkHTML(model.id, model.getState())
        }).then(() => {
            model.enabled = false
            return checkHTML(model.id, model.getState())
        })
    });

    it(" html changes are reflected in model ", () => {
        const [id, fieldView] = Object.entries(formContainer._fields)[0]
        const model = formContainer._model.getElement(id)
        const input = "2020-10-10"
        cy.get(`#${id}`).find("input").clear().type(input).blur().then(x => {
            expect(model.getState().value).to.equal(input)
        })
    });

    it("should toggle description and tooltip", () => {
        cy.toggleDescriptionTooltip(bemBlock, 'tooltip_scenario_test');
    })

    it("should show and hide components on certain date input", () => {
        // Rule on datePicker1: When input of datePicker1 is 2022-12-23 => Show datepicker3 and Hide datePicker4

        const [datePicker1, datePicker1FieldView] = Object.entries(formContainer._fields)[0];
        const [datePicker3, datePicker3FieldView] = Object.entries(formContainer._fields)[2];
        const [datePicker4, datePicker4FieldView] = Object.entries(formContainer._fields)[3];
        const input = '2022-12-23';

        cy.get(`#${datePicker1}`).find("input").type(input).blur().then(x => {
            cy.get(`#${datePicker3}`).should('be.visible')
            cy.get(`#${datePicker4}`).should('not.be.visible')
        })
    })

    it("should enable and disable components on certain date input", () => {
        // Rule on datePicker1: When input of datePicker1 is 2023-01-01 => Enable datepicker2 and Disable datePicker4

        const [datePicker1, datePicker1FieldView] = Object.entries(formContainer._fields)[0];
        const [datePicker2, datePicker2FieldView] = Object.entries(formContainer._fields)[1];
        const [datePicker4, datePicker4FieldView] = Object.entries(formContainer._fields)[3];
        const input = '2023-01-01'

        cy.get(`#${datePicker1}`).find("input").type(input).blur().then(x => {
            cy.get(`#${datePicker2}`).find("input").should('be.enabled')
            cy.get(`#${datePicker4}`).find("input").should('not.be.enabled')
        })
    })

    it("should show validation error messages based on expression rules", () => {
        // Rule on datePicker4: Validate datePicker4 using Expression: datePicker4 === 2023-01-01

        const [datePicker4, datePicker1FieldView] = Object.entries(formContainer._fields)[3];
        const incorrectInput = "2023-01-02";
        const correctInput = "2023-01-01";

        cy.get(`#${datePicker4}`).find("input").clear().type(incorrectInput).blur().then(x => {
            cy.get(`#${datePicker4}`).find(".cmp-adaptiveform-datepicker__errormessage").should('have.text',"Please enter a valid value.")
        })

        cy.get(`#${datePicker4}`).find("input").clear().type(correctInput).blur().then(x => {
            cy.get(`#${datePicker4}`).find(".cmp-adaptiveform-datepicker__errormessage").should('have.text',"")
        })
    })

    it("should set and clear value based on rules", () => {
        // Rule on datePicker6: When input of datePicker6 is '2023-01-12', set value of datePicker4 to '2023-01-01' and clear value of datePicker1

        const [datePicker1, datePicker1FieldView] = Object.entries(formContainer._fields)[0];
        const [datePicker4, datePicker4FieldView] = Object.entries(formContainer._fields)[3];
        const [datePicker6, datePicker6FieldView] = Object.entries(formContainer._fields)[5];

        const input = "2023-01-12";
        cy.get(`#${datePicker1}`).find("input").clear().type('2022-05-18')
        cy.get(`#${datePicker6}`).find("input").clear().type(input).blur().then(x => {
            cy.get(`#${datePicker1}`).find("input").should('have.value', "")
            cy.get(`#${datePicker4}`).find("input").should('have.value', "2023-01-01")
        })
    })

    it("Formatters test on Custom DatePicker widget", () => {

        const [datePicker5, datePicker5FieldView] = Object.entries(formContainer._fields)[4];
        const incorrectInput = "01-01-2023";
        const correctInput = "2023-01-01";

        cy.get(`#${datePicker5}`).find("input").should('have.attr',"type", "text");
        cy.get(`#${datePicker5}`).find("input").clear().type(incorrectInput).blur().then(x => {
            cy.get(`#${datePicker5}`).find(".cmp-adaptiveform-datepicker__errormessage").should('have.text',"Specify the value in allowed format : date.")
        })

        cy.get(`#${datePicker5}`).find("input").clear().type(correctInput).blur().then(x => {
            cy.get(`#${datePicker5}`).find(".cmp-adaptiveform-datepicker__errormessage").should('have.text',"")
            cy.get(`#${datePicker5}`).find("input").should("have.value", "January 1, 2023")
            const model = formContainer._model.getElement(datePicker5)
            expect(model.getState().value).to.equal(correctInput)
        })
        cy.get(`#${datePicker5}`).find("input").focus().then(x => {
            cy.get(`#${datePicker5}`).find("input").should("have.value", "Sunday, January 1, 2023")
        })
    })

    it("Test changing dates in datePicker with edit/display patterns", () => {
        const [datePicker7, datePicker7FieldView] = Object.entries(formContainer._fields)[6];

        const date = '2023-08-10';
        cy.get(`#${datePicker7}`).find("input").clear().type(date).then(() => {
            cy.get(`#${datePicker7}`).find("input").blur().should("have.value", "Thursday, 10 August, 2023");
            cy.get(`#${datePicker7}`).find("input").focus().should("have.value","10/8/2023");
        });

        // choose a different date and check if its persisted
        cy.get(`#${datePicker7}`).find(".cmp-adaptiveform-datepicker__calendar-icon").should("be.visible").click().then(() => {
            cy.get("#li-day-3").should("be.visible").click(); // clicking on the 2nd day of the month of October 2023
            cy.get(`#${datePicker7}`).find("input").blur().should("have.value","Wednesday, 2 August, 2023");
            cy.get(`#${datePicker7}`).find("input").focus().should("have.value","2/8/2023");

        });

        // check clear option
        cy.get(`#${datePicker7}`).find(".cmp-adaptiveform-datepicker__calendar-icon").should("be.visible").click().then(() => {
            cy.get(".dp-clear").click();
        });

        cy.get(`#${datePicker7}`).find("input").should("have.value", "");
    });

    it("Test order of the days", () => {
        const [datePicker7, datePicker7FieldView] = Object.entries(formContainer._fields)[6];
        cy.get(`#${datePicker7}`).find(".cmp-adaptiveform-datepicker__calendar-icon").should("be.visible").click().then(() => {
            cy.get(".header").invoke("text").should("eq", 'SunMonTueWedThuFriSat');
        });
    });

    it("decoration element should not have same class name", () => {
        expect(formContainer, "formcontainer is initialized").to.not.be.null;
        cy.wrap().then(() => {
            const id = formContainer._model._children[0].id;
            cy.get(`#${id}`).parent().should("not.have.class", bemBlock);
        })
    })

    it(" should add filled/empty class at container div ", () => {
      const [id, fieldView] = Object.entries(formContainer._fields)[0]
      const model = formContainer._model.getElement(id)
      const input = "2020-10-10";
      cy.get(`#${id}`).should('have.class', 'cmp-adaptiveform-datepicker--empty');
      cy.get(`#${id}`).invoke('attr', 'data-cmp-required').should('eq', 'false');
      cy.get(`#${id}`).invoke('attr', 'data-cmp-readonly').should('eq', 'false');
      cy.get(`#${id}`).find("input").clear().type(input).blur().then(x => {
          expect(model.getState().value).to.equal(input);
          cy.get(`#${id}`).should('have.class', 'cmp-adaptiveform-datepicker--filled');
      });
    });

    it(" should support display value expression", () => {
        if(toggle_array.includes("FT_FORMS-13193")) {
            const [dateInput, dateInputView] = Object.entries(formContainer._fields)[7];
            const input = '2024-02-02';
            const formatted=  '2024-02-02 today'
            let model = dateInputView.getModel();

            cy.get(`#${dateInput}`).find("input").clear().type(input).blur().then(x => {
                expect(model.getState().value).to.equal('2024-02-02');
                expect(model.getState().displayValue).to.be.equal(formatted)
                cy.get(`#${dateInput}`).find('input').should('have.value', model.getState().displayValue);
            })
        }
    });

})
