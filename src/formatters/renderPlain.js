import _ from 'lodash';

const checkVal = (val) => {
  if (_.isPlainObject(val)) { return '[complex value]'; }
  if (typeof (val) === 'string') { return `'${val}'`; }
  return val;
};
const getTemplate = (path, typeOfChange) => `Property ${path} was ${typeOfChange}`;
const getDelitedRaw = (path) => getTemplate(path, 'removed');
const getAddedRaw = (path, val) => `${getTemplate(path, 'added')} with value ${checkVal(val)}`;
const getUpdatedRaw = (path, val1, val2) => `${getTemplate(path, 'updated')}. From ${checkVal(val1)} to ${checkVal(val2)}`;

const renderAsPlain = (items, path = '') => {
  if (!(items instanceof Array)) { return ''; }

  const plainItems = items.map(({ name, value, status }) => {
    const newPath = (path) ? `${path}.${name}` : `${name}`;
    const updatedItem = items
      .filter((other) => (other.name === name) && (other.status !== status))[0];

    const statusToRaw = {
      same: '',
      container: renderAsPlain(value, newPath),
      delited: (updatedItem)
        ? getUpdatedRaw(newPath, value, updatedItem.value)
        : getDelitedRaw(newPath),
      added: (updatedItem) ? '' : getAddedRaw(newPath, value),
    };
    return statusToRaw[status];
  })
    .filter((item) => item !== '');

  return _.flatten(plainItems).join('\n');
};

export default renderAsPlain;
