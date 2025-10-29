import { KeyValue } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupByRow'
})
export class GroupByRowPipe implements PipeTransform {

  transform(items: KeyValue<string, string>[], itemsPerRow: number): KeyValue<string, string>[][] {
    const grouped = [];
    for (let i = 0; i < items.length; i += itemsPerRow) {
      grouped.push(items.slice(i, i + itemsPerRow));
    }
    return grouped;
  }

}
