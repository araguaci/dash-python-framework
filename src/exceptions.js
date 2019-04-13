import {contains, has} from 'ramda';

export function propTypeErrorHandler(e, props, type) {
    /*
     * If wrong prop type was passed in, e.message looks like:
     *
     * Error: "Failed component prop type: Invalid component prop `animate` of type `number` supplied to `function GraphWithDefaults(props) {
     *   var id = props.id ? props.id : generateId();
     *   return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(PlotlyGraph, _extends({}, props, {
     *     id: id
     *   }));
     * }`, expected `boolean`."
     *
     *
     * If a required prop type was omitted, e.message looks like:
     *
     * "Failed component prop type: The component prop `options[0].value` is marked as required in `function Checklist(props) {
     *    var _this;
     *
     *    _classCallCheck(this, Checklist);
     *
     *     _this = _possibleConstructorReturn(this, _getPrototypeOf(Checklist).call(this, props));
     *     _this.state = {
     *       values: props.values
     *     };
     *     return _this;
     *   }`, but its value is `undefined`."
     *
     */

    const messageParts = e.message.split('`');
    let errorMessage;
    if (contains('is marked as required', e.message)) {

        const invalidPropPath = messageParts[1];
        errorMessage = `${invalidPropPath} in ${type}`;
        if (props.id) {
            errorMessage += ` with ID "${props.id}"`;
        }
        errorMessage += ` is required but it was not provided.`;

    } else if(contains('Invalid component prop', e.message)) {

        const invalidPropPath = messageParts[1];
        const invalidPropTypeProvided = messageParts[3];
        const expectedPropType = messageParts[7];

        errorMessage = `Invalid argument \`${invalidPropPath}\` passed into ${type}`;
        if (props.id) {
            errorMessage += ` with ID "${props.id}"`;
        }
        errorMessage += '.';

        errorMessage += (
            `\nExpected type \`${expectedPropType}\`` +
            `\nWas supplied type \`${invalidPropTypeProvided}\``
        );

        if (has(invalidPropPath, props)) {
            /*
             * invalidPropPath may be nested like `options[0].value`.
             * For now, we won't try to unpack these nested options
             * but we could in the future.
             */
            const jsonSuppliedValue = JSON.stringify(props[invalidPropPath], null, 2);
            if (jsonSuppliedValue) {
                if (contains('\n', jsonSuppliedValue)) {
                    errorMessage += `\nValue provided: \n${jsonSuppliedValue}`;
                } else {
                    errorMessage += `\nValue provided: ${jsonSuppliedValue}`;
                }
            }
        }

    } else {
        /*
         * Not aware of other prop type warning messages.
         * But, if they exist, then at least throw the default
         * react prop types error
         */
        throw e;
    }

    throw new Error(errorMessage);
}
