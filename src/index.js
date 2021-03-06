import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import process from 'process';
import parse from './parse';
import render from './formatters';

const getContent = (filePath) => {
  const fullPath = path.resolve(process.cwd(), filePath);
  return fs.readFileSync(fullPath, 'utf-8');
};

const getExt = (filePath) => path.extname(filePath).slice(1);

const statusDictionary = {
  deleted: 'deleted',
  added: 'added',
  same: 'same',
  parent: 'parent',
  updated: 'updated',
};
const buildStateItem = (name, value, status) => ({ name, value, status });
const buildStateUpdatedItem = (name, compositeValueOnTimeline, status) => ({
  name, compositeValueOnTimeline, status,
});
const buildStateParent = (name, children) => ({ name, children, status: statusDictionary.parent });

const makeState = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  const allKeys = _.union(keys1, keys2);
  const stateItems = allKeys.map((key) => {
    const content1 = object1[key];
    const content2 = object2[key];

    if (!_.has(object2, key)) {
      return buildStateItem(key, content1, statusDictionary.deleted);
    }
    if (!_.has(object1, key)) {
      return buildStateItem(key, content2, statusDictionary.added);
    }
    if (_.isEqual(content1, content2)) {
      return buildStateItem(key, content1, statusDictionary.same);
    }
    if (_.isPlainObject(content1) && _.isPlainObject(content2)) {
      const children1 = content1;
      const children2 = content2;
      return buildStateParent(key, makeState(children1, children2));
    }
    const compositeValueOnTimeline = {
      before: content1,
      after: content2,
    };
    return buildStateUpdatedItem(key, compositeValueOnTimeline, statusDictionary.updated);
  });
  return stateItems;
};

const gendiff = (path1, path2, format = 'marker') => {
  const objectBefore = parse(getContent(path1), getExt(path1));
  const objectAfter = parse(getContent(path2), getExt(path2));
  return render(format)(makeState(objectBefore, objectAfter));
};

export default gendiff;
