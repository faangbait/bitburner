import LLNode from "structures/basics/llNode";

class LinkedList<T> {
  head: null | LLNode<T>;
  tail: null | LLNode<T>;
  length: number;
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // add an element at the last position
  push = (key: T) => {
    const node = new LLNode(key, this);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }
    this.length++;
    return node;
  };

  // removes the last element and return it
  pop = () => {
    // return undefined if it's an empty list
    if (!this.head) return;
    const last = this.tail;
    // if there is only an element, head and tail will be null;
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
      this.length = 0;
      return last;
    }
    // we need to assign a the element that points to tail as the new tail
    let node = this.head;
    while (node !== this.tail) {
      if (node.next === this.tail) {
        this.tail = node;
        this.tail.next = null;
        this.length--;
        return last;
      }
      node = node.next!;
    }
  };

  // removes the first element and return it
  shift = () => {
    if (!this.head) return;

    const first = this.head;
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
      this.length = 0;
      return first;
    }

    this.head = this.head.next;
    this.length--;
    return first;
  };

  // add an element in the beginning of the list
  unshift = (key: T) => {
    let node = new LLNode(key, this);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return this;
    }

    node.next = this.head;
    this.head = node;
    this.length++;
    return this;
  };

  // returns the kth element
  get = (k: number) => {
    // negative index or empty list or out of range
    if (k < 0 || this.length === 0 || k >= this.length) return null;
    let count = 0;
    let node = this.head;
    while (count !== k) {
      node = node!.next;
      count++;
    }
    return node;
  };

  // set the kth element with val
  set = (k: number, key: T) => {
    let node = this.get(k);
    if (!node) return false;
    node.key = key;
    return true;
  };

  // insert a new node in the kth position
  insert = (k: number, key: T) => {
    if (k < 0 || k > this.length) return false;
    if (k === 0) {
      this.unshift(key);
      return true;
    }
    if (k === this.length) {
      this.push(key);
      return true;
    }
    let node = this.get(k - 1)!;
    let newNode = new LLNode(key, this);
    newNode.next = node.next;
    node.next = newNode;
    this.length++;
    return true;
  };

  // remove the node from kth position, and return its value
  remove = (k: number) => {
    if (k < 0 || k > this.length - 1) return;
    if (k === 0) return this.shift();
    if (k === this.length - 1) return this.pop();
    let node = this.get(k - 1)!;
    let removed = node.next!;
    node.next = removed.next;
    removed.next = null;
    this.length--;
    return removed.key;
  };

  reverse = () => {
    let node = this.head;
    [[this.head], [this.tail]] = [[this.tail], [this.head]];
    let next;
    let prev: LLNode<T> | null = null;
    for (let i = 0; i < this.length; i++) {
      // prev -> node -> next
      // node -> prev
      next = node!.next;
      node!.next = prev;
      prev = node as LLNode<T>;
      node = next;
    }
    return this;
  };

  print = () => {
    var arr: T[] = [];
    var current = this.head;
    while (current) {
      arr.push(current.key);
      current = current.next;
    }
    console.log(arr);
  };
}

export default LinkedList;
