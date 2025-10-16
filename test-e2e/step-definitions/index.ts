import { Then, type MemoryValue } from '@qavajs/core';
import { expect } from '@qavajs/validation';

Then('I expect {value} memory value to be equal {value}', async function(actual: MemoryValue, expected: MemoryValue) {
    const actualValue = await actual.value();
    const expectedValue = await expected.value();
    expect(expectedValue).toEqual(actualValue);
});


