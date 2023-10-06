import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs'

export class StoreService<T> {
  private store!: BehaviorSubject<T[]>;
  public store$!: Observable<T[]>;

  constructor(data: Observable<T[]>) {
    this.store = new BehaviorSubject<T[]>([]);
    firstValueFrom(data)
      .then(r => {
        this.store.next(r);
        this.store$ = this.store.asObservable();
      }, error => {
      });
  }

  public getData() {
    return this.store.value;
  }

  public add(el: T) {
    this.store.next([...this.store.value, el]);
  }

  public async addFromHttp<K>(request: Observable<T>) {
    return await firstValueFrom(request)
      .then(r => {
        this.add(r);
      }, error => {
        return Promise.reject("Server Error");
      });
  }

  public update(el: T, index: number) {
    this.store.value.splice(index, 1, el);
    this.store.next(this.store.value);
  }

  public async updateFromHttp(request: Observable<T>, index: number) {
    await firstValueFrom(request)
      .then(r => {
        this.update(r, index);
      }, error => {
        return Promise.reject("Server Error");
      });
  }

  public remove(index: number) {
    this.store.value.splice(index, 1);
    this.store.next([...this.store.value]);
  }

  /**
   * Process only one deletion request at a time to avoid index discrepancies.
   * @param request 
   * @param index 
   */
  public async removeFromHttp(request: Observable<T>, index: number) {
    await firstValueFrom(request)
      .then(r => {
        this.remove(index);
      }, error => {

      });
  }

}
