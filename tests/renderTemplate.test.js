const { renderTemplate } = require('../src/renderTemplate');

describe('renderTemplate', () => {
  test('replaces a single placeholder', () => {
    expect(renderTemplate('Olá {{name}}', { name: 'Alice' })).toBe('Olá Alice');
  });

  test('replaces multiple placeholders', () => {
    const result = renderTemplate('{{greeting}} {{socio_administrador}}!', {
      greeting: 'Olá',
      socio_administrador: 'João Silva',
    });
    expect(result).toBe('Olá João Silva!');
  });

  test('leaves unknown placeholders intact', () => {
    expect(renderTemplate('Hello {{unknown}}', { name: 'Bob' })).toBe('Hello {{unknown}}');
  });

  test('replaces same placeholder multiple times', () => {
    expect(renderTemplate('{{x}} and {{x}}', { x: 'foo' })).toBe('foo and foo');
  });

  test('returns template unchanged when data is empty', () => {
    expect(renderTemplate('no placeholders', {})).toBe('no placeholders');
  });
});
